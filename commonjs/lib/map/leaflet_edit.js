// KML Track Editing functionality using Leaflet.Draw
// This file contains all logic for editing KML tracks on canyon pages

// Global variables for edit state
var editableGroup = null;
var originalKMLURL = null;
var isEditMode = false;
var drawControl = null;
var hasChanges = false;
var drawHandlersRegistered = false;

// Track types and their standard colors
var TRACK_TYPES = {
    'Approach': '#00CD00',
    'Descent': '#FF0000',
    'Exit': '#A200FF',
    'Alternate': '#0000FF',
    'Shortcut': '#00CD00',
    'Private Property': '#F0F000',
    'Other': '#808080'
};

// Diamond icon for markers (same as in leaflet_icons.js)
function getDiamondIcon() {
    if (typeof KMLDiamond !== 'undefined') {
        return KMLDiamond();
    }
    // Fallback if KMLDiamond not loaded yet
    return L.icon({
        iconUrl: '/leaflet/images/open-diamond.png',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });
}

function loadKMLToEditableGroup(map, kmlurl) {
    originalKMLURL = kmlurl;
    editableGroup = new L.FeatureGroup();
    map.addLayer(editableGroup);

    $.get(kmlurl, function (kmltext) {
        var track = new L.KML(kmltext, 'text/xml');

        track.on('add', function () {
            extractLayersToGroup(track._layers, editableGroup);
            updateLegendFromGroup(editableGroup);

            if (editableGroup.getLayers().length > 0) {
                map.fitBounds(editableGroup.getBounds());
            }

            addEditControls();
        });

        map.addLayer(track);

    }).fail(function (jqXHR, textStatus, errorThrown) {
        console.log(errorThrown);
    });
}

function extractLayersToGroup(layers, group) {
    if (!layers) return;

    Object.keys(layers).forEach(function (key) {
        var layer = layers[key];

        if (layer instanceof L.Polyline && !(layer instanceof L.Polygon)) {
            layer.options._kmlName = layer.options.name;
            layer.options._kmlColor = layer.options.color;
            layer.options._kmlDescription = layer.options.description || '';

            layer.options._kmlType = detectTrackType(layer.options.name, layer.options.color);

            setupTrackPopup(layer);
            setupLayerEventHandlers(layer);

            group.addLayer(layer);
        } else if (layer instanceof L.Marker) {
            layer.options._kmlName = layer.options.name;
            layer.options._kmlDescription = layer.options.description || '';

            // Always set diamond icon on markers
            layer.setIcon(getDiamondIcon());

            setupMarkerPopup(layer);
            setupLayerEventHandlers(layer);

            group.addLayer(layer);
        }

        if (layer._layers) {
            extractLayersToGroup(layer._layers, group);
        }
    });
}

function setupLayerEventHandlers(layer) {
    if (layer.on) {
        layer.on('edit', function() {
            hasChanges = true;
            updateSaveButtonState();
            updateLegendFromGroup(editableGroup);
        });

        // For markers being dragged
        layer.on('dragend', function() {
            hasChanges = true;
            updateSaveButtonState();
        });
    }
}

function setupTrackPopup(layer) {
    var popupContent = '<div style="min-width: 150px;">';
    popupContent += '<b>' + (layer.options._kmlName || 'Unnamed Track') + '</b><br>';
    popupContent += '<span style="color: ' + layer.options._kmlColor + '">● </span>';
    popupContent += (layer.options._kmlType || 'Other') + '<br>';
    if (currentUser) {
        popupContent += '<button id="edit-track-path-btn" style="margin-top: 8px; padding: 5px 10px; cursor: pointer; margin-right: 5px; display: none;">Edit Track</button>';
        popupContent += '<button id="edit-track-type-btn" style="margin-top: 8px; padding: 5px 10px; cursor: pointer; display: none;">Change Name & Type</button>';
    }
    popupContent += '</div>';

    layer.bindPopup(popupContent);

    layer.on('popupopen', function() {
        var pathBtn = document.getElementById('edit-track-path-btn');
        var typeBtn = document.getElementById('edit-track-type-btn');

        if (pathBtn && typeBtn) {
            if (isEditMode) {
                pathBtn.style.display = 'inline-block';
                typeBtn.style.display = 'inline-block';
            } else {
                pathBtn.style.display = 'none';
                typeBtn.style.display = 'none';
            }
        }

        if (pathBtn) {
            pathBtn.onclick = function() {
                layer.closePopup();
                // Enable editing directly on this layer
                if (layer.editing) {
                    layer.editing.enable();
                    hasChanges = true;
                    updateSaveButtonState();
                }
            };
        }

        if (typeBtn) {
            typeBtn.onclick = function() {
                showTrackTypeDialog(function(trackType, trackName) {
                    var color = TRACK_TYPES[trackType] || '#FF0000';

                    layer.options._kmlName = trackName;
                    layer.options.name = trackName;
                    layer.options._kmlColor = color;
                    layer.options.color = color;
                    layer.options._kmlType = trackType;
                    layer.setStyle({ color: color });

                    setupTrackPopup(layer);
                    layer.closePopup();

                    hasChanges = true;
                    updateSaveButtonState();
                    updateLegendFromGroup(editableGroup);
                }, layer.options._kmlType, layer.options._kmlName);
            };
        }
    });
}

function setupMarkerPopup(layer) {
    var popupContent = '<div style="min-width: 150px;">';
    popupContent += '<b>' + (layer.options._kmlName || 'Unnamed Marker') + '</b><br>';
    if (currentUser) {
        popupContent += '<button id="edit-marker-path-btn" style="margin-top: 8px; padding: 5px 10px; cursor: pointer; margin-right: 5px; display: none;">Edit Marker</button>';
        popupContent += '<button id="edit-marker-name-btn" style="margin-top: 8px; padding: 5px 10px; cursor: pointer; display: none;">Change Name</button>';
    }
    popupContent += '</div>';

    layer.bindPopup(popupContent);

    layer.on('popupopen', function() {
        var pathBtn = document.getElementById('edit-marker-path-btn');
        var nameBtn = document.getElementById('edit-marker-name-btn');

        if (pathBtn && nameBtn) {
            if (isEditMode) {
                pathBtn.style.display = 'inline-block';
                nameBtn.style.display = 'inline-block';
            } else {
                pathBtn.style.display = 'none';
                nameBtn.style.display = 'none';
            }
        }

        if (pathBtn) {
            pathBtn.onclick = function() {
                layer.closePopup();
                // Enable dragging for this marker
                if (layer.dragging) {
                    layer.dragging.enable();
                    hasChanges = true;
                    updateSaveButtonState();
                }
            };
        }

        if (nameBtn) {
            nameBtn.onclick = function() {
                showMarkerNameDialog(function(markerName) {
                    layer.options._kmlName = markerName;
                    layer.options.name = markerName;

                    setupMarkerPopup(layer);
                    layer.closePopup();

                    hasChanges = true;
                    updateSaveButtonState();
                    updateLegendFromGroup(editableGroup);
                }, layer.options._kmlName);
            };
        }
    });
}

function detectTrackType(name, color) {
    if (!name) return null;

    var nameLower = name.toLowerCase();

    for (var type in TRACK_TYPES) {
        if (nameLower.indexOf(type.toLowerCase()) !== -1) {
            return type;
        }
    }

    for (var type in TRACK_TYPES) {
        if (TRACK_TYPES[type] === color) {
            return type;
        }
    }

    return null;
}

function updateLegendFromGroup(featureGroup) {
    var legendHTML = '';

    featureGroup.eachLayer(function (layer) {
        if (layer.options._kmlName && layer.options._kmlColor) {
            var length = 0;
            if (layer instanceof L.Polyline) {
                length = computeLength(layer);
            }
            var lengthStr = '';
            if (length > 0) {
                lengthStr = ' (' + (length / 1000).toFixed(2) + ' km)';
            }

            legendHTML += '<i style="background: ' + layer.options._kmlColor +
                '; width: 12px; height: 12px; display: inline-block;"></i> ' +
                layer.options._kmlName + lengthStr + '<br>';
        }
    });

    var legendContents = document.getElementById('legend-contents');
    if (legendContents) {
        legendContents.innerHTML = legendHTML;
    }
}

function addEditControls() {
    if (!document.getElementById('kmlfilep')) return;
    if (!currentUser) return;

    var existingControls = document.getElementById('map-edit-controls');
    if (existingControls) return;

    var EditControl = L.Control.extend({
        options: {
            position: 'topleft'
        },

        onAdd: function (map) {
            var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
            container.id = 'map-edit-controls';
            container.style.backgroundColor = 'white';
            container.style.width = '30px';
            container.style.height = '30px';
            container.style.cursor = 'pointer';
            container.style.textAlign = 'center';
            container.style.lineHeight = '30px';
            container.innerHTML = '✏️';
            container.title = 'Edit map tracks and markers';

            container.onclick = function(e) {
                L.DomEvent.stopPropagation(e);
                L.DomEvent.preventDefault(e);
                toggleEditMode();
            };

            return container;
        }
    });

    map.addControl(new EditControl());
}

function toggleEditMode() {
    if (isEditMode) {
        disableEditMode();
    } else {
        enableEditMode();
    }
}

var saveControl = null;
var cancelControl = null;

function updateSaveButtonState() {
    var saveButton = document.querySelector('.leaflet-control-save');
    if (saveButton) {
        if (hasChanges) {
            saveButton.style.opacity = '1';
            saveButton.style.cursor = 'pointer';
            saveButton.title = 'Save changes';
        } else {
            saveButton.style.opacity = '0.4';
            saveButton.style.cursor = 'not-allowed';
            saveButton.title = 'No changes to save';
        }
    }
}

function enableEditMode() {
    isEditMode = true;
    hasChanges = false;

    // Check if drawControl already exists
    if (!drawControl) {
        drawControl = new L.Control.Draw({
            edit: {
                featureGroup: editableGroup,
                edit: false, // Disable edit layers button - use popup instead
                remove: true
            },
            draw: {
                polyline: true,
                polygon: false,
                circle: false,
                rectangle: false,
                marker: {
                    icon: getDiamondIcon()
                },
                circlemarker: false
            }
        });
        map.addControl(drawControl);
    }

    var editButton = document.getElementById('map-edit-controls');
    if (editButton) {
        editButton.innerHTML = '❌';
        editButton.title = 'Exit edit mode';
        editButton.style.backgroundColor = '#ffeb3b';
    }

    // Debug: log if toolbar was created
    console.log('Edit mode enabled, drawControl:', drawControl);
    console.log('Leaflet.Draw toolbar elements:', document.querySelectorAll('.leaflet-draw'));

    var SaveControl = L.Control.extend({
        options: { position: 'topleft' },
        onAdd: function (map) {
            var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-save');
            container.style.backgroundColor = '#4CAF50';
            container.style.width = '30px';
            container.style.height = '30px';
            container.style.cursor = 'not-allowed';
            container.style.textAlign = 'center';
            container.style.lineHeight = '30px';
            container.style.opacity = '0.4';
            container.innerHTML = '💾';
            container.title = 'No changes to save';
            container.onclick = function(e) {
                L.DomEvent.stopPropagation(e);
                L.DomEvent.preventDefault(e);
                if (hasChanges) {
                    saveMap();
                }
            };
            return container;
        }
    });

    var CancelControl = L.Control.extend({
        options: { position: 'topleft' },
        onAdd: function (map) {
            var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
            container.style.backgroundColor = '#f44336';
            container.style.width = '30px';
            container.style.height = '30px';
            container.style.cursor = 'pointer';
            container.style.textAlign = 'center';
            container.style.lineHeight = '30px';
            container.innerHTML = '🚫';
            container.title = 'Cancel changes';
            container.onclick = function(e) {
                L.DomEvent.stopPropagation(e);
                L.DomEvent.preventDefault(e);
                cancelEdit();
            };
            return container;
        }
    });

    saveControl = new SaveControl();
    cancelControl = new CancelControl();
    map.addControl(saveControl);
    map.addControl(cancelControl);

    // Only register draw event handlers once
    if (!drawHandlersRegistered) {
        setupDrawEventHandlers();
        drawHandlersRegistered = true;
    }
}

function disableEditMode() {
    isEditMode = false;

    if (drawControl) {
        map.removeControl(drawControl);
        drawControl = null;
    }

    if (saveControl) {
        map.removeControl(saveControl);
        saveControl = null;
    }

    if (cancelControl) {
        map.removeControl(cancelControl);
        cancelControl = null;
    }

    var editButton = document.getElementById('map-edit-controls');
    if (editButton) {
        editButton.innerHTML = '✏️';
        editButton.title = 'Edit map tracks and markers';
        editButton.style.backgroundColor = 'white';
    }

    // Disable editing on all layers
    editableGroup.eachLayer(function(layer) {
        if (layer.editing && layer.editing.enabled && layer.editing.enabled()) {
            layer.editing.disable();
        }
        if (layer.dragging && layer.dragging.enabled && layer.dragging.enabled()) {
            layer.dragging.disable();
        }
    });
}

function showConfirmDialog(message, callback) {
    var overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
    overlay.style.zIndex = '10000';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';

    var dialog = document.createElement('div');
    dialog.style.backgroundColor = 'white';
    dialog.style.padding = '20px';
    dialog.style.borderRadius = '5px';
    dialog.style.maxWidth = '400px';
    dialog.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';

    var messageDiv = document.createElement('div');
    messageDiv.textContent = message;
    messageDiv.style.marginBottom = '20px';
    dialog.appendChild(messageDiv);

    var buttonContainer = document.createElement('div');
    buttonContainer.style.textAlign = 'right';

    var cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.style.padding = '8px 15px';
    cancelBtn.style.marginRight = '10px';
    cancelBtn.style.cursor = 'pointer';
    cancelBtn.onclick = function() {
        document.body.removeChild(overlay);
        callback(false);
    };
    buttonContainer.appendChild(cancelBtn);

    var okBtn = document.createElement('button');
    okBtn.textContent = 'OK';
    okBtn.style.padding = '8px 15px';
    okBtn.style.backgroundColor = '#4CAF50';
    okBtn.style.color = 'white';
    okBtn.style.border = 'none';
    okBtn.style.cursor = 'pointer';
    okBtn.style.borderRadius = '3px';
    okBtn.onclick = function() {
        document.body.removeChild(overlay);
        callback(true);
    };
    buttonContainer.appendChild(okBtn);

    dialog.appendChild(buttonContainer);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
}

function showMessageDialog(message, callback) {
    var overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
    overlay.style.zIndex = '10000';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';

    var dialog = document.createElement('div');
    dialog.style.backgroundColor = 'white';
    dialog.style.padding = '20px';
    dialog.style.borderRadius = '5px';
    dialog.style.maxWidth = '400px';
    dialog.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';

    var messageDiv = document.createElement('div');
    messageDiv.textContent = message;
    messageDiv.style.marginBottom = '20px';
    dialog.appendChild(messageDiv);

    var buttonContainer = document.createElement('div');
    buttonContainer.style.textAlign = 'right';

    var okBtn = document.createElement('button');
    okBtn.textContent = 'OK';
    okBtn.style.padding = '8px 15px';
    okBtn.style.backgroundColor = '#4CAF50';
    okBtn.style.color = 'white';
    okBtn.style.border = 'none';
    okBtn.style.cursor = 'pointer';
    okBtn.style.borderRadius = '3px';
    okBtn.onclick = function() {
        document.body.removeChild(overlay);
        if (callback) callback();
    };
    buttonContainer.appendChild(okBtn);

    dialog.appendChild(buttonContainer);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
}

function showTrackTypeDialog(callback, initialType, initialName) {
    var overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
    overlay.style.zIndex = '10000';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';

    var dialog = document.createElement('div');
    dialog.style.backgroundColor = 'white';
    dialog.style.padding = '25px';
    dialog.style.borderRadius = '8px';
    dialog.style.maxWidth = '450px';
    dialog.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
    dialog.style.fontFamily = 'sans-serif';

    var title = document.createElement('h3');
    title.textContent = 'Track Type';
    title.style.marginTop = '0';
    title.style.marginBottom = '20px';
    title.style.fontSize = '18px';
    title.style.color = '#333';
    dialog.appendChild(title);

    var typeGrid = document.createElement('div');
    typeGrid.style.display = 'grid';
    typeGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
    typeGrid.style.gap = '10px';
    typeGrid.style.marginBottom = '20px';

    var selectedType = initialType || 'Descent';

    Object.keys(TRACK_TYPES).forEach(function(type) {
        var btn = document.createElement('button');
        btn.textContent = type;
        btn.style.padding = '12px';
        btn.style.border = 'none';
        btn.style.cursor = 'pointer';
        btn.style.borderRadius = '6px';
        btn.style.fontSize = '14px';
        btn.style.fontWeight = '500';
        btn.style.transition = 'all 0.2s';
        btn.style.backgroundColor = '#f0f0f0';
        btn.style.color = '#333';
        btn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';

        if (type === selectedType) {
            btn.style.backgroundColor = TRACK_TYPES[type];
            btn.style.color = 'white';
            btn.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
            btn.style.transform = 'scale(1.05)';
        }

        btn.onmouseover = function() {
            if (type !== selectedType) {
                btn.style.backgroundColor = '#e0e0e0';
            }
        };

        btn.onmouseout = function() {
            if (type !== selectedType) {
                btn.style.backgroundColor = '#f0f0f0';
            }
        };

        btn.onclick = function() {
            selectedType = type;
            Array.from(typeGrid.children).forEach(function(child) {
                child.style.backgroundColor = '#f0f0f0';
                child.style.color = '#333';
                child.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                child.style.transform = 'scale(1)';
            });
            btn.style.backgroundColor = TRACK_TYPES[type];
            btn.style.color = 'white';
            btn.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
            btn.style.transform = 'scale(1.05)';
        };

        typeGrid.appendChild(btn);
    });

    dialog.appendChild(typeGrid);

    var nameLabel = document.createElement('label');
    nameLabel.textContent = 'Track Name:';
    nameLabel.style.display = 'block';
    nameLabel.style.marginBottom = '8px';
    nameLabel.style.fontSize = '14px';
    nameLabel.style.fontWeight = '500';
    nameLabel.style.color = '#555';
    dialog.appendChild(nameLabel);

    var nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.value = initialName || '';
    nameInput.placeholder = 'e.g., Main Canyon Descent';
    nameInput.style.width = '100%';
    nameInput.style.padding = '10px';
    nameInput.style.marginBottom = '20px';
    nameInput.style.boxSizing = 'border-box';
    nameInput.style.border = '1px solid #ddd';
    nameInput.style.borderRadius = '4px';
    nameInput.style.fontSize = '14px';
    dialog.appendChild(nameInput);

    var buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'flex-end';
    buttonContainer.style.gap = '10px';

    var cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.style.padding = '10px 20px';
    cancelBtn.style.cursor = 'pointer';
    cancelBtn.style.border = '1px solid #ddd';
    cancelBtn.style.backgroundColor = 'white';
    cancelBtn.style.borderRadius = '4px';
    cancelBtn.style.fontSize = '14px';
    cancelBtn.onclick = function() {
        document.body.removeChild(overlay);
    };
    buttonContainer.appendChild(cancelBtn);

    var okBtn = document.createElement('button');
    okBtn.textContent = 'OK';
    okBtn.style.padding = '10px 20px';
    okBtn.style.backgroundColor = '#4CAF50';
    okBtn.style.color = 'white';
    okBtn.style.border = 'none';
    okBtn.style.cursor = 'pointer';
    okBtn.style.borderRadius = '4px';
    okBtn.style.fontSize = '14px';
    okBtn.style.fontWeight = '500';
    okBtn.onclick = function() {
        var trackName = nameInput.value.trim() || selectedType;
        document.body.removeChild(overlay);
        callback(selectedType, trackName);
    };
    buttonContainer.appendChild(okBtn);

    dialog.appendChild(buttonContainer);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    nameInput.focus();
    nameInput.select();
}

function showMarkerNameDialog(callback, initialName) {
    var overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
    overlay.style.zIndex = '10000';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';

    var dialog = document.createElement('div');
    dialog.style.backgroundColor = 'white';
    dialog.style.padding = '20px';
    dialog.style.borderRadius = '5px';
    dialog.style.maxWidth = '400px';
    dialog.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';

    var title = document.createElement('h3');
    title.textContent = 'Marker Name';
    title.style.marginTop = '0';
    dialog.appendChild(title);

    var nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.value = initialName || '';
    nameInput.placeholder = 'e.g., Parking Area';
    nameInput.style.width = '100%';
    nameInput.style.padding = '8px';
    nameInput.style.marginBottom = '15px';
    nameInput.style.boxSizing = 'border-box';
    dialog.appendChild(nameInput);

    var buttonContainer = document.createElement('div');
    buttonContainer.style.textAlign = 'right';

    var cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.style.padding = '8px 15px';
    cancelBtn.style.marginRight = '10px';
    cancelBtn.style.cursor = 'pointer';
    cancelBtn.onclick = function() {
        document.body.removeChild(overlay);
    };
    buttonContainer.appendChild(cancelBtn);

    var okBtn = document.createElement('button');
    okBtn.textContent = 'OK';
    okBtn.style.padding = '8px 15px';
    okBtn.style.backgroundColor = '#4CAF50';
    okBtn.style.color = 'white';
    okBtn.style.border = 'none';
    okBtn.style.cursor = 'pointer';
    okBtn.style.borderRadius = '3px';
    okBtn.onclick = function() {
        var markerName = nameInput.value.trim() || 'Unnamed Marker';
        document.body.removeChild(overlay);
        callback(markerName);
    };
    buttonContainer.appendChild(okBtn);

    dialog.appendChild(buttonContainer);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    nameInput.focus();
    nameInput.select();
}

function setupDrawEventHandlers() {
    map.on(L.Draw.Event.CREATED, function (e) {
        var layer = e.layer;

        if (layer instanceof L.Polyline) {
            showTrackTypeDialog(function(trackType, trackName) {
                var color = TRACK_TYPES[trackType] || '#FF0000';

                layer.options._kmlName = trackName;
                layer.options.name = trackName;
                layer.options._kmlColor = color;
                layer.options.color = color;
                layer.options._kmlType = trackType;
                layer.setStyle({ color: color });

                setupTrackPopup(layer);
                setupLayerEventHandlers(layer);

                editableGroup.addLayer(layer);
                hasChanges = true;
                updateSaveButtonState();
                updateLegendFromGroup(editableGroup);
            });
        } else if (layer instanceof L.Marker) {
            showMarkerNameDialog(function(markerName) {
                layer.options._kmlName = markerName;
                layer.options.name = markerName;

                setupMarkerPopup(layer);
                setupLayerEventHandlers(layer);

                editableGroup.addLayer(layer);
                hasChanges = true;
                updateSaveButtonState();
                updateLegendFromGroup(editableGroup);
            });
        }
    });

    map.on(L.Draw.Event.DELETED, function () {
        hasChanges = true;
        updateSaveButtonState();
        updateLegendFromGroup(editableGroup);
    });
}

function saveMap() {
    if (!hasChanges) {
        return;
    }

    showConfirmDialog('Save changes to KML file? This will overwrite the existing file.', function(confirmed) {
        if (!confirmed) return;

        doSaveMap();
    });
}

function doSaveMap() {

    var kmlContent = layersToKML(editableGroup);
    var fileName = decodeURIComponent(originalKMLURL.split('/').pop());

    var api = new mw.Api();

    var blob = new Blob([kmlContent], { type: 'application/vnd.google-earth.kml+xml' });
    var file = new File([blob], fileName, { type: 'application/vnd.google-earth.kml+xml' });

    api.upload(file, {
        filename: fileName,
        comment: 'Updated KML tracks via map editor',
        ignorewarnings: true
    }).done(function (result) {
        showMessageDialog('Map saved successfully!', function() {
            disableEditMode();
            location.reload();
        });
    }).fail(function (code, result) {
        if (result.upload && result.upload.warnings) {
            showMessageDialog('Map saved successfully!', function() {
                disableEditMode();
                location.reload();
            });
        } else {
            var errorMsg = 'Save failed';
            if (result && result.error && result.error.info) {
                errorMsg += ': ' + result.error.info;
            }
            showMessageDialog(errorMsg);
            console.error('Upload error:', code, result);
        }
    });
}

function cancelEdit() {
    showConfirmDialog('Discard all changes?', function(confirmed) {
        if (confirmed) {
            location.reload();
        }
    });
}

function layersToKML(featureGroup) {
    var kmlDoc = '<?xml version="1.0" encoding="UTF-8"?>\n';
    kmlDoc += '<kml xmlns="http://www.opengis.net/kml/2.2">\n';
    kmlDoc += '<Document>\n';

    var styles = {};
    featureGroup.eachLayer(function (layer) {
        if (layer.options._kmlColor) {
            var styleId = 'style_' + layer.options._kmlColor.replace('#', '');
            if (!styles[styleId]) {
                styles[styleId] = layer.options._kmlColor;
            }
        }
    });

    Object.keys(styles).forEach(function (styleId) {
        kmlDoc += '  <Style id="' + styleId + '">\n';
        kmlDoc += '    <LineStyle>\n';
        kmlDoc += '      <color>' + hexToKMLColor(styles[styleId]) + '</color>\n';
        kmlDoc += '      <width>2</width>\n';
        kmlDoc += '    </LineStyle>\n';
        kmlDoc += '  </Style>\n';
    });

    featureGroup.eachLayer(function (layer) {
        kmlDoc += layerToKMLPlacemark(layer);
    });

    kmlDoc += '</Document>\n';
    kmlDoc += '</kml>';
    return kmlDoc;
}

function layerToKMLPlacemark(layer) {
    var kml = '  <Placemark>\n';
    kml += '    <name>' + escapeXML(layer.options._kmlName || 'Unnamed') + '</name>\n';

    if (layer.options._kmlDescription) {
        kml += '    <description>' + escapeXML(layer.options._kmlDescription) + '</description>\n';
    }

    if (layer instanceof L.Polyline && !(layer instanceof L.Polygon)) {
        var styleId = 'style_' + layer.options._kmlColor.replace('#', '');
        kml += '    <styleUrl>#' + styleId + '</styleUrl>\n';
        kml += '    <LineString>\n';
        kml += '      <coordinates>\n';

        var latlngs = layer.getLatLngs();
        latlngs.forEach(function (latlng) {
            kml += '        ' + latlng.lng + ',' + latlng.lat + ',0\n';
        });

        kml += '      </coordinates>\n';
        kml += '    </LineString>\n';
    } else if (layer instanceof L.Marker) {
        kml += '    <Point>\n';
        var latlng = layer.getLatLng();
        kml += '      <coordinates>' + latlng.lng + ',' + latlng.lat + ',0</coordinates>\n';
        kml += '    </Point>\n';
    }

    kml += '  </Placemark>\n';
    return kml;
}

function hexToKMLColor(hex) {
    hex = hex.replace('#', '');
    var r = hex.substr(0, 2);
    var g = hex.substr(2, 2);
    var b = hex.substr(4, 2);
    return 'ff' + b + g + r;
}

function escapeXML(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&apos;');
}
