const $ = require("jquery");
const store = require("./store");
const { spawn } = require('child_process');


// const explanation = $("#explanation");

inputs = {};
// const pip_query = spawn('pip', ['-lh', '/usr']);

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

const auto_save_elements = $(".auto-save");

$("input[placeholder]").each(function () {
    $(this).attr('size', $(this).attr('placeholder').length);
});

function prepareCheckboxSwitch(checkbox, elements){
    const changeAvailability = ()=>{
        const checked = checkbox.prop('checked');
        if (checked){
            elements.each((i,e)=>{
                $(e).prop("disabled", false)
            })
        }
        else{
            elements.each((i,e)=>{
                $(e).prop("disabled", true)
            })
        }
    };

    checkbox.change(changeAvailability);

    changeAvailability();

}

/**
 *
 * @param {jQuery} element
 */
function prepareAutoSaveLoad(element){
    const type = (element.attr('type'));
    const isBS3Btn = element.hasClass('btn')
    if (type === "checkbox" || isBS3Btn){

        if (isBS3Btn){

            element.click(()=>{
                element.siblings().each((i, obj) =>{
                    store.set($(obj).attr("id"), false);
                })
                store.set(element.attr("id"), true);
            });


        }
        else{

            element.change(()=>{

                const checked = element.prop('checked');
                store.set(element.attr("id"), checked);


            });
        }


        const stored = store.get(element.attr("id"));

        if (stored === true){

            if (isBS3Btn){

                element.addClass('active')
            }
            else{
                element.prop('checked', true);
            }
        }
        else{
            if (isBS3Btn){
                element.removeClass('active')
            }
        }

    }
    else{
        element.focusout((e)=>{
            auto_save_elements.each((i,e)=>{store.set($(e).attr("id"), $(e).val())});
        });
        // alert(store.get(element.attr("id")));
        element.val(store.get(element.attr("id")));
    }


}

function prepareAutoDecide(elements, element, func){

    elements.forEach((e)=>{
        e.on("input", ()=>{
            const filtered = elements.map((x)=>{return x.val()}).filter((xx)=>{return xx === ""});
            if (filtered.length === 0){
                element.val(func(elements));
            }else{
                element.val("");
            }
        })
    })
}




const package_name_input = $("#package-name");
const license_person_name_input = $("#license-person-name");
const git_repo_name_input = $("#git-repo-name");
const pypi_username = $("#pypi-username");
const github_username = $("#github-username");
const url_on_pypi = $("#url-on-pypi");
const author_on_pypi = $("#author-on-pypi");
const author_email = $("#author-email");
const python_version_boxes = $(".python-version");
const dependencyChoiceBtns = $("#dependency-choices label")
const testStyleBtns = $("#test-style label")
const devToolBtns = $("#starting-dev-dependencies label")

const create_cmd_entry_checkbox = $("#create-cmd-entry");
const command_name_input = $("#command-name");

function extractNames(data){
    const lines = data.split('\n');

    return lines.map((e)=>{
        const segments = e.split(' ');
        if (segments.length > 0){
            return segments[0]
        }
        else{
            return "";
        }
    });


}

package_name_input.focusout(()=>{
    const name = package_name_input.val();
    const loading = $("#package-check-loading");
    const error = $("#package-check-error");
    const no_python_message = $('#no-python-message')
    const duplicate = $("#package-duplicate-error");
    const available = $("#package-available-message");

    // explanation.hide();

    available.hide();
    duplicate.hide();
    loading.hide();
    error.hide();


    if (name !== ""){

        function display_outcome(does_python_exist){
            // in case the input changed during pypi query
            if (name === package_name_input.val()){

                loading.hide();

                // pip gives warning: You are using pip version 10.0.1, however version 19.2.2 is available.
                // You should consider upgrading via the 'python -m pip install --upgrade pip' command.
                if (errorData !== "" && ! errorData.includes('python -m pip install --upgrade pip')){
                    console.log(errorData)
                    error.fadeIn('fast');
                }
                else if (! does_python_exist){
                    console.log('nonon')
                    no_python_message.show();
                }
                else{
                    const names = extractNames(entireData);
                    if (names.filter((e) =>{
                        return e === name;
                    }).length !== 0){
                        duplicate.show();
                    }
                    else{
                        available.show().fadeOut("slow");
                    }
                }

            }
            else{
                loading.hide();
            }

        }


        const pip_query = spawn('python3', ['-m', 'pip', 'search', name]);
        loading.fadeIn("slow");

        let entireData="";
        let errorData = "";
        pip_query.stdout.on('data', (data) => {
            entireData +=  data.toString();
        });

        pip_query.stderr.on('data', (data) => {
            errorData += data.toString();
        });

        let no_python3 = false
        let no_python = false
        pip_query.on('error', (err) => {
            no_python3 = true

            // fall back from python3 to python
            const python_pip_query = spawn('python', ['-m', 'pip', 'search', name]);
            entireData = ""
            errorData = ""

            python_pip_query.stdout.on('data', (data) => {
                entireData +=  data.toString();
            });

            python_pip_query.stderr.on('data', (data) => {
                errorData += data.toString();
            });

            python_pip_query.on('error', (err) => {
                no_python = true
            })

            python_pip_query.on('close', (code) => {
                display_outcome(! no_python)
            });

        })

        pip_query.on('close', (code) => {
            if (! no_python3){
                display_outcome(true)

            }

        });

    }



});

prepareCheckboxSwitch(create_cmd_entry_checkbox, $([command_name_input]));
prepareAutoSaveLoad(license_person_name_input);
prepareAutoSaveLoad(pypi_username);
prepareAutoSaveLoad(github_username);
prepareAutoSaveLoad(author_email);
prepareAutoSaveLoad(author_on_pypi);

python_version_boxes.each((i, obj)=>prepareAutoSaveLoad($(obj)));
dependencyChoiceBtns.each((i, obj)=>prepareAutoSaveLoad($(obj)))
testStyleBtns.each((i, obj)=>prepareAutoSaveLoad($(obj)))


prepareAutoDecide([license_person_name_input], author_on_pypi, (e)=>{return e[0].val()});
prepareAutoDecide([package_name_input], git_repo_name_input, (e)=>{return e[0].val()});

prepareAutoDecide([package_name_input, github_username], url_on_pypi, (elements)=>{
    return "https://github.com/" + elements[0].val()+ "/" + elements[1].val()
});


prepareAutoDecide([git_repo_name_input, github_username], url_on_pypi, (elements)=>{
        return "https://github.com/" + elements[0].val()+ "/" + elements[1].val()
    });

prepareAutoDecide([package_name_input],command_name_input, (elements)=>{return elements[0].val()});

inputs.prepareForSaves = () => {

  license_person_name_input.focusout((e)=>{
      store.set("license_person_name", license_person_name_input.val());

  });
    github_username.focusout((e)=>{
        store.set("github_username", github_username.val());
    })

};

inputs.getAuthorEmail = () =>{
    return $("#author-email").val();
};

inputs.getAuthorOnPypi= () =>{
    return $("#author-on-pypi").val();
};

inputs.getPackageDescription = () =>{
    return $("#package-description").val();
};

inputs.getGithubUsername = () =>{
    return $("#github-username").val();
};

inputs.getGitRepoName = () =>{
    return $("#git-repo-name").val();
};

inputs.getLicensePersonName = () =>{
    return $("#license-person-name").val();
};

/**
 * @returns {Object}
 */
inputs.getPythonVersions = () => {
    const dict = {}
    $.each($(".python-version"), (_, v) => {dict[v.id] = $(v).is(':checked')})
    return dict
}

/**
 * @returns {Object}
 */
inputs.getOS = () => {
    const dict = {}
    $.each($(".os"), (_, v) => {dict[v.id] = $(v).is(':checked')});
    return dict
}

inputs.getPypiUsername = () =>{
    return $("#pypi-username").val();
};

inputs.getCreateCmdEntry = ()=>{
    return $("#create-cmd-entry").is(":checked");
};

inputs.getCommandName = ()=>{
    return $("#command-name").val();
};

inputs.getRootFolder = () =>{
    return $("#directory")[0].files[0].path
};

inputs.getPackageName = () =>{
    return $("#package-name").val();
};

/**
 *
 * @returns {"requirements"|"pipfile"}
 */
inputs.getDependencyChoice = () =>{
    return dependencyChoiceBtns.filter(".active").attr('id');
};

/**
 *
 * @returns {"pytest"|"unittest"}
 */
inputs.getTestStyle = () =>{
    return testStyleBtns.filter(".active").attr('id');
};

inputs.getDevToolNames = () =>{
    const names = []
    $.each(devToolBtns.filter(".active"), (_, v) => {names.push($(v).text().trim())})
    return names
}

inputs.checkCompleteness= ()=>{

    const files = $("#directory")[0].files;
    if (files.length === 0){
        $("#directory-empty-error").fadeIn('slow').fadeOut('slow');
        return false;
    }

    if ($("#package-name").val() === ""){
        $("#package-empty-error").fadeIn('slow').fadeOut('slow');
        return false;
    }

    return true;
};




module.exports = inputs;