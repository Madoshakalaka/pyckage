const $ = require("jquery")
const path = require('path')
const inputs = require("./userInputs")
const fs = require('fs')
const Mustache = require('mustache')
const {app, dialog} = require('electron').remote
// const dialog = require('electron').remote.dialog

const appPath = app.getAppPath()

function rendererPath(p) {
    return path.join(appPath, '.webpack', 'renderer', 'main_window', p)
}

// disable bs checkbox button groups with "disabled" class
$('.btn-group .btn.disabled').click(function(event) {
    event.stopPropagation();
});

// const explanation = $("#explanation");

const pypi_license_strings = {'MIT': "License :: OSI Approved :: MIT License"}

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


function replaceArgument(original, tag, substitute) {

    let res = original

    while (res.indexOf('pykage:' + tag + ':') !== -1) {
        const begin = res.indexOf('pykage:' + tag + ':')
        const last = begin + tag.length + 8
        res = res.substring(0, begin) + substitute + res.substring(last)
    }
    return res
}

function writeTemplate(templateFile, lookup, ...paths) {
    let content = fs.readFileSync(rendererPath(templateFile)).toString()
    content = Mustache.render(content, lookup)
    // $.each(lookup, (tag, value) => {
    //
    //     content = replaceArgument(content, tag, value);
    // });

    fs.writeFileSync(path.join.apply(null, paths), content)
    return content
}

function ensureDirSync (dirpath) {
    try {
        fs.mkdirSync(dirpath, { recursive: true })
    } catch (err) {
        if (err.code !== 'EEXIST') throw err
    }
}


const button = $("#generate-button")
const generating = $("#generating")

button.click(() => {
        button.attr("disabled", true)
        const isInputOK = inputs.checkCompleteness()
        if (isInputOK) {
            const packageName = inputs.getPackageName()
            const projectFolder = path.join(inputs.getRootFolder(), packageName)
            const description = inputs.getPackageDescription()
            const createCmdEntry = inputs.getCreateCmdEntry()
            const commandName = inputs.getCommandName()
            const pypiUsername = inputs.getPypiUsername()
            const licensePersonName = inputs.getLicensePersonName()
            const pythonVersions = inputs.getPythonVersions()
            const os = inputs.getOS()
            os['windows-only'] = os['windows'] && (! os['mac']) && (! os['linux'])
            console.log(os)
            console.log(pythonVersions)
            const currentYear = (new Date()).getFullYear().toString()
            const gitRepoName = inputs.getGitRepoName()
            const githubUsername = inputs.getGithubUsername()
            const githubDescription = inputs.getPackageDescription()
            const authorOnPypi = inputs.getAuthorOnPypi()
            const authorEmail = inputs.getAuthorEmail()
            const dependencyChoice = inputs.getDependencyChoice()

            const lookup = {
                'package-name': packageName,
                'package-description': description,
                'module-folder': packageName,
                'python-versions': pythonVersions,
                'os': os,
                'create-cmd-entry': createCmdEntry,
                'command-name': commandName,
                'pypi-username': pypiUsername,
                'license-person-name': licensePersonName,
                'license-year': currentYear,
                'git-repo-name': gitRepoName,
                'github-username': githubUsername,
                'github-description': githubDescription,
                'author-on-pypi': authorOnPypi,
                'author-email': authorEmail,
            }
            if (dependencyChoice === 'pipfile') lookup['virtual-env-instruction'] = 'pipenv install --dev'
            else if (dependencyChoice === 'requirements') lookup['virtual-env-instruction'] = 'pip install -r requirements'


            generating.fadeIn('slow')
            function createFiles() {
                ensureDirSync(projectFolder)
                ensureDirSync(path.join(projectFolder, packageName))
                fs.writeFileSync(path.join(projectFolder, packageName, "__init__.py"), "")

                ensureDirSync(path.join(projectFolder, 'readme_assets'))
                ensureDirSync(path.join(projectFolder, 'tests'))
                ensureDirSync(path.join(projectFolder, 'tests', 'fixtures'))
                fs.writeFileSync(path.join(projectFolder, 'tests', '__init__.py'), '')


                writeTemplate('main.py.mst', lookup, projectFolder, packageName, 'main.py')

                if (createCmdEntry) {
                    writeTemplate('__main__.py.mst', lookup, projectFolder, packageName, '__main__.py')
                }

                if (dependencyChoice === 'pipfile') {
                    writeTemplate('pipfile.mst', lookup, projectFolder, 'pipfile')
                } else if (dependencyChoice === 'requirements') {
                    writeTemplate('requirements.txt.mst', lookup, projectFolder, 'requirements.txt')
                }

                writeTemplate('main_test.py.mst', lookup, projectFolder, 'tests', 'main_test.py')

                writeTemplate('gitignore.mst', lookup, projectFolder, '.gitignore')
                writeTemplate('travis.yml.mst', lookup, projectFolder, '.travis.yml')

                writeTemplate('LICENSE.mst', lookup, projectFolder, 'LICENSE')

                writeTemplate('README.md.mst', lookup, projectFolder, 'README.md')

                writeTemplate('setup.py.mst', lookup, projectFolder, 'setup.py')

                writeTemplate('pykage-to-do.txt.mst', lookup, projectFolder, 'pykage-to-do.txt')

                generating.hide()

                // explanation.show();
                $("#generation-complete-message").fadeIn('slow').fadeOut('slow')
            }

            if (!fs.existsSync(projectFolder)) {
                createFiles()
            } else {
                const msg = "folder " + projectFolder + ' already exists. Do you wish to overwrite it'
                dialog.showMessageBox(null, {
                    type: 'warning',
                    buttons: ['no', 'yes'],
                    defaultId: 0,
                    title: 'Folder exists',
                    message: msg
                }, (response) => {
                    if (response === 1){
                        createFiles()
                    }
                    generating.hide()
                })


            }
        }

        button.attr("disabled", false)
    }
)





