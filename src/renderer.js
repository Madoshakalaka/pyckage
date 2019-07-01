const $ = require("jquery");
const path = require('path');
const inputs = require("./userInputs");
const fs = require('fs');

const {app} = require('electron').remote;

const appPath = app.getAppPath();

function rendererPath(p){
    return path.join(appPath, '.webpack', 'renderer', 'main_window',p);
}

const manual_instruction_list = $("#manual-instruction-list");

const explanation = $("#explanation");

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


function replaceArgument(original, tag, substitute){

    let res = original;

    while (res.indexOf('pykage:'+tag+':') !== -1){
        const begin = res.indexOf('pykage:'+tag+':');
        const last = begin + tag.length+8;
        res = res.substring(0, begin) + substitute + res.substring(last);
    }


    return res;
}

function writeTemplate(templateFile, lookup, ...paths){
    let content = fs.readFileSync(rendererPath(templateFile)).toString();
    $.each(lookup, (tag, value) => {

        content = replaceArgument(content, tag, value);

    });

    fs.writeFileSync(path.join.apply(null, paths), content);
    return content;
}



const button = $("#generate-button");
const generating = $("#generating");

button.click(()=>{
    button.attr("disabled", true);
    const isInputOK = inputs.checkCompleteness();
    if (isInputOK){
        const packageName = inputs.getPackageName();
        const projectFolder = path.join(inputs.getRootFolder(), packageName);
        const description = inputs.getDescription();
        const commandName = inputs.getCommandName();
        const pypiUsername = inputs.getPypiUsername();
        const licensePersonName = inputs.getLicensePersonName();
        const currentYear = (new Date()).getFullYear().toString();
        const gitRepoName = inputs.getGitRepoName();
        const githubUsername = inputs.getGithubUsername();
        const githubDescription = inputs.getPackageDescription();
        const authorOnPypi = inputs.getAuthorOnPypi();
        const authorEmail = inputs.getAuthorEmail();

        const lookup = {
            'package-name':packageName,
            'package-description':description,
            'module-folder':packageName,
            'command-name':commandName,
            'pypi-user-name':pypiUsername,
            'license-person-name': licensePersonName,
            'license-year': currentYear,
            'git-repo-name':gitRepoName,
            'github-username':githubUsername,
            'github-description':githubDescription,
            'author-on-pypi':authorOnPypi,
            'author-email': authorEmail,
        };

        generating.fadeIn('slow');

        if (!fs.existsSync(projectFolder)){
            fs.mkdirSync(projectFolder);
            fs.mkdirSync(path.join(projectFolder, packageName));
            fs.writeFileSync(path.join(projectFolder, packageName, "__init__.py"),"");

            fs.mkdirSync(path.join(projectFolder, 'readme_assets'));
            fs.mkdirSync(path.join(projectFolder, 'tests'));
            fs.mkdirSync(path.join(projectFolder, 'tests', 'fixtures'));
            fs.writeFileSync(path.join(projectFolder, 'tests', '__init__.py'));


            writeTemplate('main.py', lookup, projectFolder, packageName, 'main.py');


            writeTemplate('main_test.py', lookup, projectFolder, 'tests', 'main_test.py');


            // content = fs.readFileSync(rendererPath('main_test.py')).toString();
            // content = replaceArgument(content, 'module-folder', packageName);
            // content = replaceArgument(content, 'command-name', commandName);
            // fs.writeFileSync(path.join(projectFolder, 'tests', "main_test.py"), content);

            content = fs.readFileSync(rendererPath('gitignore')).toString();
            fs.writeFileSync(path.join(projectFolder, ".gitignore"), content);


            writeTemplate('travis.yml', lookup, projectFolder, '.travis.yml');

            writeTemplate('LICENSE', lookup, projectFolder, 'LICENSE');

            writeTemplate('README.md', lookup, projectFolder, 'README.md');

            writeTemplate('setup.py', lookup, projectFolder, 'setup.py');


            generating.hide();
            manual_instruction_list.show();
            explanation.show();
            $("#generation-complete-message").fadeIn('slow').fadeOut('slow');

        }
        else{
            generating.hide();
            $("#directory-exists-error").fadeIn('slow').fadeOut('slow');
        }
    }

    button.attr("disabled", false);
}

);





