Dropzone.autoDiscover = false;

let uploadedImageBase64 = null;

function init() {
    let dz = new Dropzone("#dropzone", {
        url: "/",
        maxFiles: 1,
        addRemoveLinks: true,
        acceptedFiles: "image/*",
        autoProcessQueue: false
    });

    dz.on("addedfile", function (file) {
        if (dz.files[1] != null) dz.removeFile(dz.files[0]);

        let reader = new FileReader();
        reader.onload = function (event) {
            uploadedImageBase64 = event.target.result;
        };
        reader.readAsDataURL(file);
    });

    dz.on("complete", function () {

        let url = "http://127.0.0.1:5000/classify_image";

        $.post(url, { image_data: uploadedImageBase64 }, function (data) {

            if (!data || data.length === 0 || data.error) {
                $("#resultsHolder").hide();
                $("#predictedOutput").hide();
                $("#error").show();
                return;
            }

            $("#error").hide();

            // ALWAYS USE THE FIRST RESULT (contains correct probability array)
            let result = data[0];

            // show uploaded image
            $("#uploadedImage").attr("src", uploadedImageBase64);

            // predicted name
            $("#predictedName").text(result.class);
            $("#predictedOutput").show();

            // -----------------------------
            // FILL TABLE WITH TRUE ACCURACY
            // -----------------------------
            let probs = result.class_probability;
            let dict = result.class_dictionary;

            for (let personName in dict) {
                let index = dict[personName];
                let value = probs[index] || 0;

                let percent = (value * 100).toFixed(2);

                $("#score_" + personName).html(percent + "%");
            }

            $("#resultsHolder").show();

        });
    });

    $("#submitBtn").on("click", function () {
        dz.processQueue();
    });
}

$(document).ready(function () {
    $("#error").hide();
    $("#resultsHolder").hide();
    $("#predictedOutput").hide();
    init();
});