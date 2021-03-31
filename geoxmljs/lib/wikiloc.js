function decodeWikilocEncodedPath(encodedPath) {
    if (encodedPath.startsWith("geom:")) encodedPath = encodedPath.substring("geom:".length);

    var byteArray = base64ToUint8Array(encodedPath);
    var json = toGeoJSON(byteArray);

    var coords = json.features[0].geometry.coordinates;

    var latlngs = coords.map(function(v) { return v[0] + "," + v[1] });

    return latlngs;
}

function toGeoJSON(buffer) {

    for (var taStruct = {
        buffer: buffer,
        cursor: 0,
        bufferLength: buffer.byteLength || buffer.length,
        refpoint: new Int32Array(4)
    }, features = []; taStruct.cursor < taStruct.bufferLength;)
    {
        var res = readBuffer(taStruct);

        res.geoms
            ? features = features.concat(transforms[res.type](res.geoms, res.ids, taStruct.ndims))
            : features.push({
                type: "Feature",
                geometry: transforms[taStruct.type](res, taStruct.ndims)
            });
    }

    return {
        type: "FeatureCollection",
        features: features
    }
}

var constants = {
    LINESTRING: 2
}

var transforms = {};
transforms[constants.LINESTRING] = function (coordinates, ndims) {
    return createGeometry(constants.LINESTRING, toCoords(coordinates, ndims));
}

function createGeometry(type, coordinates) {
    return {
        type: typeMap[type],
        coordinates: coordinates
    }
}

typeMap = {};
typeMap[constants.LINESTRING] = "LineString";


function toCoords(coordinates, ndims) {
    var coords, len, i, pos, c;

    for (coords = [], i = 0, len = coordinates.length; len > i; i += ndims) {
        for (pos = [], c = 0; ndims > c; ++c) pos.push(coordinates[i + c]);
        coords.push(pos);
    }

    return coords;
}

function base64ToUint8Array(t) {
    return new Uint8Array(atob(t).split("").map(function(t) { return t.charCodeAt(0); }));
}

function readBuffer(taStruct) {
    var flag, hasZ = 0, hasM = 0;

    flag = taStruct.buffer[taStruct.cursor], taStruct.cursor++;

    var precisionXy = unzigzag((240 & flag) >> 4);

    taStruct.type = 15 & flag, taStruct.factors = [], taStruct.factors[0] = taStruct.factors[1] =
        Math.pow(10, precisionXy), flag = taStruct.buffer[taStruct.cursor], taStruct.cursor++, taStruct.has_bbox =
        1 & flag, taStruct.has_size = (2 & flag) >> 1, taStruct.has_idlist = (4 & flag) >> 2, taStruct.is_empty =
        (16 & flag) >> 4;

    var extendedDims = (8 & flag) >> 3;

    if (extendedDims) {
        var extendedDimsFlag = taStruct.buffer[taStruct.cursor];
        taStruct.cursor++ , hasZ = 1 & extendedDimsFlag, hasM = (2 & extendedDimsFlag) >> 1;
        var precisionZ = (28 & extendedDimsFlag) >> 2,
            precisionM = (224 & extendedDimsFlag) >> 5;
        hasZ && (taStruct.factors[2] = Math.pow(10, precisionZ)), hasM &&
            (taStruct.factors[2 + hasZ] = Math.pow(10, precisionM)), taStruct.has_z = hasZ, taStruct.has_m =
            hasM;
    }

    var ndims = 2 + hasZ + hasM;
    if (taStruct.ndims = ndims, taStruct.has_size && (taStruct.size = ReadVarInt64(taStruct)), taStruct.has_bbox) {
        var bbox, i;
        for (bbox = [], i = 0; i <= ndims - 1; i++) {
            var min = ReadVarSInt64(taStruct),
                max = min + ReadVarSInt64(taStruct);
            bbox[i] = min, bbox[i + ndims] = max;
        }
        taStruct.bbox = bbox;
    }
    return readObjects(taStruct);
}

function unzigzag(nVal) {
    return (1 & nVal) === 0 ? nVal >> 1 : -(nVal >> 1) - 1;
}

function readObjects(taStruct) {
    var type, i;

    for (type = taStruct.type, i = 0; i < taStruct.ndims; i++) {
        taStruct.refpoint[i] = 0;
    }

    //if (type === constants.POINT) return parse_point(ta_struct);
    if (type === constants.LINESTRING) return parse_line(taStruct);
    //if (type === constants.POLYGON) return parse_polygon(ta_struct);
    //if (type === constants.MULTIPOINT) return parse_multi(ta_struct, parse_point);
    //if (type === constants.MULTILINESTRING) return parse_multi(ta_struct, parse_line);
    //if (type === constants.MULTIPOLYGON) return parse_multi(ta_struct, parse_polygon);
    //if (type === constants.COLLECTION) return parse_collection(ta_struct, howMany);

    throw new Error("Unknown type: " + type);
}

function parse_line(taStruct) {
    var npoints = ReadVarInt64(taStruct);
    return read_pa(taStruct, npoints);
}

function ReadVarSInt64(taStruct) {
    var nVal = ReadVarInt64(taStruct);
    return unzigzag(nVal);
}

function ReadVarInt64(taStruct) {
    for (var nByte, cursor = taStruct.cursor, nVal = 0, nShift = 0; ;) {
        if (nByte = taStruct.buffer[cursor], 0 === (128 & nByte))
            return cursor++, taStruct.cursor = cursor, nVal | nByte << nShift;

        nVal |= (127 & nByte) << nShift, cursor++, nShift += 7;
    }
}

function read_pa(taStruct, npoints) {
    var i, j, ndims = taStruct.ndims,
        factors = taStruct.factors,
        coords = new Array(npoints * ndims);

    for (i = 0; npoints > i; i++)
        for (j = 0; ndims > j; j++) {
            taStruct.refpoint[j] += ReadVarSInt64(taStruct), coords[ndims * i + j] = taStruct.refpoint[j] / factors[j];
        }

    if (taStruct.include_bbox && !taStruct.has_bbox)
        for (i = 0; npoints > i; i++)
            for (j = 0; ndims > j; j++) {
                var c = coords[j * ndims + i];
                c < taStruct.bbox.min[j] && (taStruct.bbox.min[j] = c),
                c > taStruct.bbox.max[j] && (taStruct.bbox.max[j] = c);
            }
    return coords;
}
