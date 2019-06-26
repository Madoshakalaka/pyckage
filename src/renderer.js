const $ = require("jquery");
const path = require('path');
const inputs = require("./userInputs");
const fs = require('fs');

const {app} = require('electron').remote;

const appPath = app.getAppPath();

function rendererPath(p){
    return path.join(appPath, '.webpack', 'renderer', 'main_window',p);
}


const pypi_license_strings = {'MIT':"License :: OSI Approved :: MIT License"};

// const {spawn} = require('child_process');
//
// const ls = spawn('travis', ['encrypt', '123']);
//
// ls.stdout.on('data', (data) => {
//     console.log(`stdout: ${data}`);
// });
//
// ls.stderr.on('data', (data) => {
//     console.log(`stderr: ${data}`);
// });
//
// ls.on('close', (code) => {
//     console.log(`child process exited with code ${code}`);
// });



function createProject(){

}
console.log(fs.existsSync(rendererPath('__init__.py')));
// console.log(fs.readdirSync("/"));

const button = $("#generate-button");

button.click(()=>{
    button.attr("disabled", true);
    const isInputOK = inputs.checkCompleteness();
    if (isInputOK){
        const packageName = inputs.getPackageName();
        const projectFolder = path.join(inputs.getRootFolder(), packageName);

        if (!fs.existsSync(projectFolder)){
            fs.mkdirSync(projectFolder);
            fs.mkdirSync(path.join(projectFolder, packageName));
            fs.writeFileSync(path.join(projectFolder, packageName, "__init__.py"),"")


        }
        else{
            $("#directory-exists-error").fadeIn('slow').fadeOut('slow');
        }
    }

    button.attr("disabled", false);
}

);





