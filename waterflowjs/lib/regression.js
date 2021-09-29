// Return the function value for x, a, b, and c.
function expCurveValue(x, a, b, c)
{
    return a + b * Math.exp(c * x);
}

// Return the function x-value for y, a, b, and c.
function expCurveXValue(y, a, b, c)
{
    //y must be greater (or equal) to a, or NaN will result
    return Math.log((y - a) / b) / c;
}

// single pass method to calculate exponential curve coefficients from pages 16-18 on this paper:
// www.scribd.com/doc/14674814/Regressions-et-equations-integrales
function regressionCalcFrenchMethod(pts) {
    if (!pts) return {};
    
    var n = pts.length;
    if (n < 3) return {};

    var i, x, y;

    var sum = (previousValue, currentValue) => previousValue + currentValue;
    
    //calculate the data arrays
    var Sk = []; //Sk
    var xk_minus_x1_squared = []; //(xk-x1)^2
    var xk_minus_x1_times_Sk = []; //(xk-x1)*Sk
    var Sk_squared = []; //Sk^2
    var yk_minus_y1 = []; //yk-y1
    var yk_minus_y1_times_xk_minus_x1 = []; //(yk-y1)*(xk-x1)
    var yk_minus_y1_times_Sk = []; //(yk-y1)*Sk
    var yk_Sum = pts.reduce((A, B) => A + B.Y, 0);
    
    if (yk_Sum === 0) return {}; //error, all y values are 0

    Sk[0] = 0;

    for (i = 1; i < n; i++) {
        x = pts[i].X;
        y = pts[i].Y;

        var x_minus_1 = pts[i - 1].X;
        var y_minus_1 = pts[i - 1].Y;

        var x1 = pts[0].X;
        var y1 = pts[0].Y;

        var _Sk = Sk[i - 1] + 0.5 * (y + y_minus_1) * (x - x_minus_1);

        Sk.push(_Sk);

        var _xk_minus_x1 = x - x1;

        xk_minus_x1_squared.push(Math.pow(_xk_minus_x1, 2));
        xk_minus_x1_times_Sk.push(_xk_minus_x1 * _Sk);
        Sk_squared.push(Math.pow(_Sk, 2));

        var _yk_minus_y1 = y - y1;

        yk_minus_y1.push(_yk_minus_y1);
        yk_minus_y1_times_xk_minus_x1.push(_yk_minus_y1 * _xk_minus_x1);
        yk_minus_y1_times_Sk.push(_yk_minus_y1 * _Sk);
    }
    
    var matrix1 = [];
    var xk_minus_x1_times_Sk_Sum = xk_minus_x1_times_Sk.reduce(sum);
    matrix1.push([xk_minus_x1_squared.reduce(sum), xk_minus_x1_times_Sk_Sum]);
    matrix1.push([xk_minus_x1_times_Sk_Sum, Sk_squared.reduce(sum)]);

    if (!matrixIsValid(matrix1)) return {};

    var matrix1Inv = matrixInvert(matrix1);

    if (!matrixIsValid(matrix1Inv)) return {};

    var matrix2 = [];
    matrix2.push([yk_minus_y1_times_xk_minus_x1.reduce(sum)]);
    matrix2.push([yk_minus_y1_times_Sk.reduce(sum)]);

    var matrixDot1 = matrixDot(matrix1Inv, matrix2);

    //var A1 = matrixDot1[0, 0];
    var B1 = matrixDot1[1];

    //var a1 = -A1 / B1;
    var c1 = B1;
    var c2 = c1[0];

    var thetaK = []; //Theta k
    var thetaK_squared = []; //Theta k^2
    var yk_times_thetaK = []; //yk*Theta k

    for (i = 0; i < n; i++)
    {
        x = pts[i].X;
        y = pts[i].Y;

        var _thetaK = Math.exp(c2 * x);
        thetaK.push(_thetaK);
        thetaK_squared.push(Math.pow(_thetaK, 2));
        yk_times_thetaK.push(y * _thetaK);
    }

    var matrix1b = [];
    var thetaKSum = thetaK.reduce(sum);
    matrix1b.push([n, thetaKSum]);
    matrix1b.push([thetaKSum, thetaK_squared.reduce(sum)]);

    if (!matrixIsValid(matrix1b)) return {};

    var matrix1bInv = matrixInvert(matrix1b);

    if (!matrixIsValid(matrix1bInv)) return {};

    var matrix2b = [];
    matrix2b.push([yk_Sum]);
    matrix2b.push([yk_times_thetaK.reduce(sum)]);

    var matrixDot1b = matrixDot(matrix1bInv, matrix2b);

    var a2 = matrixDot1b[0][0];
    var b2 = matrixDot1b[1][0];

    var best_a = a2;
    var best_b = b2;
    var best_c = c2;

    var error = regressionRSquared(pts, best_a, best_b, best_c);

    return {
        a: best_a,
        b: best_b,
        c: best_c,
        r2: error
    }
}

function regressionRSquared(pts, a, b, c) {
    var ssRes = 0;
    var ssTot = 0;

    var t = pts.length;

    var yAve = 0;

    var i;
    for (i = 0; i < t; i++) {
        yAve += pts[i].Y;
    }

    yAve = yAve / t;

    for (i = 0; i < t; i++) {
        var x = pts[i].X;
        var y = pts[i].Y;
        var f = expCurveValue(x, a, b, c);

        ssRes += Math.pow(y - f, 2);

        ssTot += Math.pow(y - yAve, 2);
    }

    var r2 = 1 - ssRes / ssTot;

    return r2;
}

function matrixDot(A, B) {
    var result = new Array(A.length).fill(0).map(() => new Array(B[0].length).fill(0));

    return result.map((row, i) => {
        return row.map((_, j) => {
            return A[i].reduce((sum, elm, k) => sum + (elm * B[k][j]), 0);
        });
    });
}

function matrixIsValid(array) {
    for (var i = 0; i < array.length; ++i)
        for (var j = 0; j < array[0].length; ++j)
            if (isNaN(array[i][j])) return false;

    return true;
}


//from the numeric library https://github.com/sloisel/numeric/blob/master/src/numeric.js

function matrixInvert(array) {
    var s = matrixDim(array), abs = Math.abs, m = s[0], n = s[1];
    var A = matrixClone(array), Ai, Aj;
    var I = matrixIdentity(m), Ii, Ij;
    var i, j, k, x;
    for (j = 0; j < n; ++j) {
        var i0 = -1;
        var v0 = -1;
        for (i = j; i !== m; ++i) { k = abs(A[i][j]); if (k > v0) { i0 = i; v0 = k; } }
        Aj = A[i0]; A[i0] = A[j]; A[j] = Aj;
        Ij = I[i0]; I[i0] = I[j]; I[j] = Ij;
        x = Aj[j];
        for (k = j; k !== n; ++k)    Aj[k] /= x;
        for (k = n - 1; k !== -1; --k) Ij[k] /= x;
        for (i = m - 1; i !== -1; --i) {
            if (i !== j) {
                Ai = A[i];
                Ii = I[i];
                x = Ai[j];
                for (k = j + 1; k !== n; ++k)  Ai[k] -= Aj[k] * x;
                for (k = n - 1; k > 0; --k) { Ii[k] -= Ij[k] * x; --k; Ii[k] -= Ij[k] * x; }
                if (k === 0) Ii[0] -= Ij[0] * x;
            }
        }
    }
    return I;
}

function matrixDim(x) {
    var y, z;
    if (typeof x === "object") {
        y = x[0];
        if (typeof y === "object") {
            z = y[0];
            if (typeof z === "object") {
                return _matrixDim(x);
            }
            return [x.length, y.length];
        }
        return [x.length];
    }
    return [];
}

function _matrixDim(x) {
    var ret = [];
    while (typeof x === "object") { ret.push(x.length); x = x[0]; }
    return ret;
}

function matrixClone(array) {
    return array.slice(0);
}

function matrixIdentity(n) {
    return matrixDiag(matrixRep([n], 1));
}

function matrixRep(s, v, k) {
    if (typeof k === "undefined") { k = 0; }
    var n = s[k], ret = Array(n), i;
    if (k === s.length - 1) {
        for (i = n - 2; i >= 0; i -= 2) { ret[i + 1] = v; ret[i] = v; }
        if (i === -1) { ret[0] = v; }
        return ret;
    }
    for (i = n - 1; i >= 0; i--) { ret[i] = numeric.rep(s, v, k + 1); }
    return ret;
}

function matrixDiag(d) {
    var i, i1, j, n = d.length, A = Array(n), Ai;
    for (i = n - 1; i >= 0; i--) {
        Ai = Array(n);
        i1 = i + 2;
        for (j = n - 1; j >= i1; j -= 2) {
            Ai[j] = 0;
            Ai[j - 1] = 0;
        }
        if (j > i) { Ai[j] = 0; }
        Ai[i] = d[i];
        for (j = i - 1; j >= 1; j -= 2) {
            Ai[j] = 0;
            Ai[j - 1] = 0;
        }
        if (j === 0) { Ai[0] = 0; }
        A[i] = Ai;
    }
    return A;
}
