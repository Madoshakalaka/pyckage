const $ = require("jquery")
const path = require('path')
const inputs = require("./userInputs")
const fs = require('fs')
const Mustache = require('mustache')
const {app, dialog, net} = require('electron').remote
const pkgstat = require('electron').remote.require('pkgstat')
const semver = require('semver')



const appPath = app.getAppPath()

function rendererPath(p) {
    return path.join(appPath, '.webpack', 'renderer', 'main_window', p)
}

// disable bs checkbox button groups with "disabled" class
$('.btn-group .btn.disabled').click(function (event) {
    event.stopPropagation()
})


const pypi_license_strings = {'MIT': "License :: OSI Approved :: MIT License"}


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

function ensureDirSync(dirpath) {
    try {
        fs.mkdirSync(dirpath, {recursive: true})
    } catch (err) {
        if (err.code !== 'EEXIST') throw err
    }
}

function unlinkSyncOrNot(file) {
    try {
        fs.unlinkSync(file)
    } catch (err) {
        if (err.code !== 'ENOENT') {
            console.log(err.code)
            throw err
        }
    }
}

/**
 * @param {string} packageName
 * @returns {string}
 */
function packageNameToFolderName(packageName) {
    return packageName.replace('-', '_')
}

function format_dev_package(packageName) {
    return pkgstat(packageName, "python").then(resp=>{

        let version = resp['version']
        const isValid = semver.valid(version)

        if (isValid) {
            const majorDotMinor = semver.major(version) + '.' + semver.minor(version)
            return packageName + ' = "~=' + majorDotMinor + '"'
        } else {
            return packageName + ' = "==' + version + '"'
        }
        }
    )

}

const button = $("#generate-button")
const generating = $("#generating")

button.on('click', () => {
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
            os['windows-only'] = os['windows'] && (!os['mac']) && (!os['linux'])
            console.log(os)
            console.log(pythonVersions)
            const currentYear = (new Date()).getFullYear().toString()
            const gitRepoName = inputs.getGitRepoName()
            const githubUsername = inputs.getGithubUsername()
            const githubDescription = inputs.getPackageDescription()
            const authorOnPypi = inputs.getAuthorOnPypi()
            const authorEmail = inputs.getAuthorEmail()

            // choose ones
            const dependencyChoice = inputs.getDependencyChoice()
            const testStyle = inputs.getTestStyle()
            console.log('create-cmd-entry', createCmdEntry)
            const lookup = {
                'package-name': packageName,
                'package-description': description,
                'package-folder-name': packageNameToFolderName(packageName),
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
                'dev-packages': []
            }

            if (dependencyChoice === 'pipfile') lookup['virtual-env-instruction'] = 'pipenv install --dev'
            else if (dependencyChoice === 'requirements') lookup['virtual-env-instruction'] = 'pip install -r requirements'

            let testFileTemplate = ''
            if (testStyle === 'pytest') {
                testFileTemplate = 'pytest__main_test.py.mst'
            } else { // unittest
                testFileTemplate = 'unittest__main_test.py.mst'
            }
            // todo: remove requirements/pipfile if chosen otherwise
            // todo: pytest__main_test.py.mst
            generating.fadeIn('slow')

            function createFiles() {
                return Promise.all(inputs.getDevToolNames().map(toolName => format_dev_package(toolName).then(resp => {
                        lookup['dev-packages'].push(resp)
                        console.log(resp)
                    })
                    )
                ).then(() => {

                    ensureDirSync(projectFolder)
                    ensureDirSync(path.join(projectFolder, packageName))
                    fs.writeFileSync(path.join(projectFolder, packageName, "__init__.py"), "")

                    ensureDirSync(path.join(projectFolder, 'readme_assets'))
                    ensureDirSync(path.join(projectFolder, 'tests'))
                    ensureDirSync(path.join(projectFolder, 'tests', 'data'))
                    fs.writeFileSync(path.join(projectFolder, 'tests', '__init__.py'), '')


                    writeTemplate('main.py.mst', lookup, projectFolder, packageName, 'main.py')
                    // console.log(createCmdEntry)
                    if (createCmdEntry) {
                        writeTemplate('__main__.py.mst', lookup, projectFolder, packageName, '__main__.py')
                    } else {
                        unlinkSyncOrNot(path.join(projectFolder, packageName, '__main__.py'))
                    }

                    if (dependencyChoice === 'pipfile') {
                        unlinkSyncOrNot(path.join(projectFolder, 'requirements.txt'))
                        writeTemplate('pipfile.mst', lookup, projectFolder, 'Pipfile')

                    } else if (dependencyChoice === 'requirements') {
                        unlinkSyncOrNot(path.join(projectFolder, 'Pipfile'))
                        writeTemplate('requirements.txt.mst', lookup, projectFolder, 'requirements.txt')
                    }

                    writeTemplate(testFileTemplate, lookup, projectFolder, 'tests', 'main_test.py')

                    writeTemplate('gitignore.mst', lookup, projectFolder, '.gitignore')
                    writeTemplate('travis.yml.mst', lookup, projectFolder, '.travis.yml')

                    writeTemplate('LICENSE.mst', lookup, projectFolder, 'LICENSE')

                    writeTemplate('README.md.mst', lookup, projectFolder, 'README.md')

                    writeTemplate('setup.py.mst', lookup, projectFolder, 'setup.py')

                    writeTemplate('pykage-to-do.txt.mst', lookup, projectFolder, 'pykage-to-do.txt')

                })

            }

            if (!fs.existsSync(projectFolder)) {
                createFiles().then(() => {
                    $("#generation-complete-message").fadeIn('slow').fadeOut('slow')
                }).finally(() => {
                    generating.hide()
                    button.attr("disabled", false)
                })
            } else {
                const msg = "folder " + projectFolder + ' already exists. Do you wish to overwrite it'
                dialog.showMessageBox(null, {
                    type: 'warning',
                    buttons: ['no', 'yes'],
                    defaultId: 0,
                    title: 'Folder exists',
                    message: msg
                }, (response) => {
                    if (response === 1) {
                        createFiles().then(() => {
                            $("#generation-complete-message").fadeIn('slow').fadeOut('slow')
                        }).finally(() => {
                            generating.hide()
                            button.attr("disabled", false)
                        })
                    }

                })


            }
        }


    }
)





