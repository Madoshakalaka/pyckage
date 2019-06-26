const $ = require("jquery");
const store = require("./store");
const { spawn } = require('child_process');

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

function prepareAutoSaveLoad(element){
    const type = (element.attr('type'));
    if (type === "checkbox"){

        element.change(()=>{
            const checked = element.prop('checked');
            store.set(element.attr("id"), checked);
        });

        const stored = store.get(element.attr("id"));

        if (stored === true){
            // alert(stored);
            element.prop('checked', true);
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
const license_person_name_input = $("#licence-person-name");
const git_repo_name_input = $("#git-repo-name");
const pypi_username = $("#pypi-user-name");
const github_username = $("#github-username");
const url_on_pypi = $("#url-on-pypi");
const author_on_pypi = $("#author-on-pypi");
const author_email = $("#author-email");
const python_version_boxes = $(".python-version");

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
    const duplicate = $("#package-duplicate-error");
    const available = $("#package-available-message");

    available.hide();
    duplicate.hide();
    loading.hide();
    error.hide();


    if (name !== ""){
        const pip_query = spawn('pip', ['search', name]);
        loading.fadeIn("slow");

        let entireData="";
        let errorData = "";
        pip_query.stdout.on('data', (data) => {
            entireData +=  data.toString();
        });

        pip_query.stderr.on('data', (data) => {
            errorData += data.toString();
        });

        pip_query.on('close', (code) => {
            if (name === package_name_input.val()){

                loading.hide();
                if (errorData !== ""){
                    error.fadeIn('fast');
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




        });

    }



});

prepareCheckboxSwitch(create_cmd_entry_checkbox, $([command_name_input]));
prepareAutoSaveLoad(license_person_name_input);
prepareAutoSaveLoad(pypi_username);
prepareAutoSaveLoad(github_username);
prepareAutoSaveLoad(author_email);
prepareAutoSaveLoad(author_on_pypi);

console.log(python_version_boxes);

python_version_boxes.each((i, obj)=>prepareAutoSaveLoad($(obj)));


prepareAutoDecide([license_person_name_input], author_on_pypi, (e)=>{return e[0].val()});
prepareAutoDecide([package_name_input], git_repo_name_input, (e)=>{return e[0].val()});

prepareAutoDecide([package_name_input, github_username], url_on_pypi, (elements)=>{
    return "https://github.com/" + elements[0].val()+ "/" + elements[1].val()
});


prepareAutoDecide([git_repo_name_input, github_username], url_on_pypi, (elements)=>{
        return "https://github.com/" + elements[0].val()+ "/" + elements[1].val()
    });

prepareAutoDecide([package_name_input],command_name_input, (elements)=>{return elements[0].val()});

// git_repo_name_input.on("input", ()=>{
//     const repo_name = git_repo_name_input.val();
//     const username = github_username.val();
//
//     if (repo_name !== "" && username !== ""){
//         url_on_pypi.val("https://github.com/" + username+ "/" + repo_name)
//
//     }
//     else{
//         url_on_pypi.val("")
//     }
// });


let inputs = {};



inputs.prepareForSaves = () => {

  license_person_name_input.focusout((e)=>{
      store.set("license_person_name", license_person_name_input.val());

  });
    github_username.focusout((e)=>{
        store.set("github_username", github_username.val());

    })

};

inputs.getRootFolder = () =>{
    return $("#directory")[0].files[0].path
};

inputs.getPackageName = () =>{
    return $("#package-name").val();
};

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