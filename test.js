let func = require('./src/helper/get-curve');
let config = require('config');
let axios = require('axios');
let fs = require('fs');

function getCurveFiles(curvePaths,i) {
    return axios({
        url: config.get("curveProviderServer") + '/curve/download',
        method: 'post',
        data: {
            curveFiles: curvePaths
        },
        responseType: 'stream',
        onDownloadProgress: function (progressEvent) {
            let percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            if (percent == 25) {
                console.log('percent of part', i + ': 25%');
            }
            if (percent == 50) {
                console.log('percent of part', i + ': 50%');
            }
            if (percent == 75) {
                console.log('percent of part', i + ': 75%');
            }
            if (percent == 100) {
                console.log('percent of part', i + ': 100%. Done');
            }
        }
    });
}

function devideArr(arr, chunkSize) {
    let result = [];
    for (var i = 0; i < arr.length; i += chunkSize)
        result.push(arr.slice(i, i + chunkSize));
    return result;
}


(async function () {
    try {
        let curvePaths = await func(config.get("mysql.local"), 'hungson');
        console.log('Start download...');
        let smallerCurvePaths = devideArr(curvePaths, 100);
        let n = smallerCurvePaths.length;  
        for (let i = 0; i < n; i++) {
                getCurveFiles(smallerCurvePaths[i], i+1).then((res)=>{
                    res.data.pipe(fs.createWriteStream('curvedownload'+i+'.zip'));
                }).catch((e)=>{
                    console.log('Download curve part', i, 'failed:', e.message);
                });
        }
    } catch (e) {
        console.log(e.message);
    }
})();
