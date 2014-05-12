var currentData;
var currentDataVariablesNames;
var allRPackages;
var modalDialog;
var modalPopUp;
var okButton;
var cancelButton;
var allData;
var allDataNames;
var editable = false;
var body;
var addRowButton;
var addColumnButton;
var removeColumnButton;
var removeRowButton;
var editColumnButton;
var editRowButton;

/*
 contains all messageHandlers
 */
$(document).ready(function(){

    init();

    Shiny.addCustomMessageHandler('createDataSelector',
        function(names){
            createDataSelector(names);
        });

    Shiny.addCustomMessageHandler('createTable',
        function(data){
            currentData = data;
            currentDataVariablesNames = getNames(currentData);
            data = data[currentDataVariablesNames[0]];
            currentDataVariablesNames = getNames(data);
            cleanTable('dataTable');
            createTable('dataTable', data);
        });

    Shiny.addCustomMessageHandler('createChooseVariableDialog',
        function(names){
            cleanModalDialog();
            createChooseVariableDialog(names);
        }
    );

    Shiny.addCustomMessageHandler('allRPackages',
        function(packages){
            allRPackages = getAllRPackagesName(packages);
        });

    Shiny.addCustomMessageHandler('availableDataInThePackage',
        function(availableData){
            cleanModalDialog();
            createSingleRadioDialog(availableData, 'getChosenData()');
        }
    );

    Shiny.addCustomMessageHandler('popUpMessage',
        function(message){
            popUpMessage(message);
        }
    );

    Shiny.addCustomMessageHandler('createInputNameDialog',
        function(message){
            createTextFieldDialog('Insert name for the data', 'getInsertedName()');
        }
    );

    Shiny.addCustomMessageHandler('resetUploadFile',
        function(message){
            resetUploadFile();
        }
    );

    Shiny.addCustomMessageHandler('allData',
        function(message){
            allData = message;
        }
    );

    Shiny.addCustomMessageHandler('allDataNames',
        function(message){
            allDataNames = message;
        }
    );

    Shiny.addCustomMessageHandler('createCSVFileOptionDialog',
        function(message){
            createFileOptionDialog(message, true);
        }
    );

    Shiny.addCustomMessageHandler('createFileOptionDialog',
        function(message){
            createFileOptionDialog(message, false);
        }
    );

    Shiny.addCustomMessageHandler('createPreviewTable',
        function(message){
            console.log(message);
            createPreviewTable(message);
        }
    );
});

init = function(){
    body = document.getElementsByTagName('body')[0];
    modalDialog = document.createElement('div');
    modalDialog.setAttribute('class', 'modalDialog');
    modalDialog.setAttribute('id', 'modalDialog');
    body.appendChild(modalDialog);
    hideModalDialog('div#modalDialog');

    modalPopUp = document.createElement('div');
    modalPopUp.setAttribute('class', 'modal');
    modalPopUp.setAttribute('id', 'modalPopUp');
    body.appendChild(modalPopUp);
    $('div#modalPopUp').hide();

    okButton = document.createElement('input');
    okButton.setAttribute('value', 'OK');
    okButton.setAttribute('type', 'button');
    okButton.setAttribute('id', 'buttonVariable');
    okButton.setAttribute('class', 'btn');

    cancelButton = document.createElement('input');
    cancelButton.setAttribute('value', 'Cancel');
    cancelButton.setAttribute('type', 'button');
    cancelButton.setAttribute('id', 'buttonVariable');
    cancelButton.setAttribute('class', 'btn');

    body = document.getElementsByTagName('body')[0];
    previewTable = document.createElement('div');
    previewTable.setAttribute('class', 'modalDialog table table-bordered table-condensed');
    previewTable.setAttribute('id', 'previewTable');
    body.appendChild(previewTable);
    $('div#previewTable').hide();

    var img = document.createElement('img');
    img.setAttribute('src', 'xButton.png');
    img.setAttribute('id', 'xButton');
    img.setAttribute('onclick', '$("div#previewTable").hide(); $("img#xButton").hide();');
    body.appendChild(img);
    $("img#xButton").hide();

    var dataSelector = $('div#dataSelector')[0];
    dataSelector.contentEditable = false;

    addRowButton = document.createElement('input');
    addRowButton.setAttribute('value', 'Add Row');
    addRowButton.setAttribute('type', 'button');
    addRowButton.setAttribute('class', 'btn');
    addRowButton.setAttribute('id','editTableDialogButton');
    addRowButton.setAttribute('onclick', 'createTextFieldDialog("Type in the formula for the new row")');

    addColumnButton = document.createElement('input');
    addColumnButton.setAttribute('value', 'Add Column');
    addColumnButton.setAttribute('type', 'button');
    addColumnButton.setAttribute('class', 'btn');
    addColumnButton.setAttribute('id','editTableDialogButton');
    addColumnButton.setAttribute('onclick', 'createTextFieldDialog("Type in the formula for the new column")'); //TODO insert nume

    removeRowButton = document.createElement('input');
    removeRowButton.setAttribute('value', 'Remove Row');
    removeRowButton.setAttribute('type', 'button');
    removeRowButton.setAttribute('class', 'btn');
    removeRowButton.setAttribute('id','editTableDialogButton');
    removeRowButton.setAttribute('onclick', 'createTextFieldDialog("Type in the row index(es)")');

    removeColumnButton = document.createElement('input');
    removeColumnButton.setAttribute('value', 'Remove Column');
    removeColumnButton.setAttribute('type', 'button');
    removeColumnButton.setAttribute('class', 'btn');
    removeColumnButton.setAttribute('id','editTableDialogButton');
    removeRowButton.setAttribute('onclick', 'createTextFieldDialog("Type in the column index(es)")');

    editRowButton = document.createElement('input');
    editRowButton.setAttribute('value', 'Edit Row');
    editRowButton.setAttribute('type', 'button');
    editRowButton.setAttribute('class', 'btn');
    editRowButton.setAttribute('id','editTableDialogButton');
    editRowButton.setAttribute('onclick', 'createTextFieldDialog("Type in the formula for editing this row")');

    editColumnButton = document.createElement('input');
    editColumnButton.setAttribute('value', 'Edit Column');
    editColumnButton.setAttribute('type', 'button');
    editColumnButton.setAttribute('class', 'btn');
    editColumnButton.setAttribute('id','editTableDialogButton');
    editColumnButton.setAttribute('onclick', 'createTextFieldDialog("Type in the formula for editing this column")');

    $("div#uploadFile_progress").remove();
};

/*
 create a modalDialog with checkboxes
 */
createChooseVariableDialog = function(names){

    modalDialog.setAttribute('id', 'chooseVariableDialog');
    modalDialog.setAttribute('style', 'width: 600px');

    var title = document.createElement('h4');
    title.innerHTML = "Choose Variables";
    modalDialog.appendChild(title);
    modalDialog.appendChild(document.createElement('br'));

    var coordVar = document.createElement('div');
    coordVar.setAttribute('class', 'variablesType');
    coordVar.setAttribute('id', 'coordVar');
    coordVar.innerHTML = 'CoordVariable';
    modalDialog.appendChild(coordVar);

    var externVar = document.createElement('div');
    externVar.setAttribute('class', 'variablesType');
    externVar.setAttribute('id', 'externVar');
    externVar.innerHTML = 'ExternVariable';
    modalDialog.appendChild(externVar);

    var internVar = document.createElement('div');
    internVar.setAttribute('class', 'variablesType');
    internVar.setAttribute('id', 'coordVar');
    internVar.innerHTML = 'InternVariable';
    modalDialog.appendChild(internVar);

    var compVar = document.createElement('div');
    compVar.setAttribute('class', 'variablesType');
    compVar.setAttribute('id', 'coordVar');
    compVar.innerHTML = 'CompVariable';
    modalDialog.appendChild(compVar);
    modalDialog.appendChild(document.createElement('br'));

    for(var i = 0; i < names.length; i++){
        var br = document.createElement('br');

        var name = document.createElement('div');
        name.setAttribute('class', 'names');
        name.innerHTML = names[i];

        var coordCheck = document.createElement('input');
        coordCheck.setAttribute('type','checkbox');
        coordCheck.setAttribute('class', 'variableChooserCheckbox coordCheck');
        coordCheck.setAttribute('value', names[i]);
        coordCheck.setAttribute('id', 'coordCheck');

        var internCheck = document.createElement('input');
        internCheck.setAttribute('type','checkbox');
        internCheck.setAttribute('class', 'variableChooserCheckbox internCheck');
        internCheck.setAttribute('value', names[i]);
        internCheck.setAttribute('id', 'internCheck');

        var externCheck = document.createElement('input');
        externCheck.setAttribute('type','checkbox');
        externCheck.setAttribute('class', 'variableChooserCheckbox externCheck');
        externCheck.setAttribute('value', names[i]);
        externCheck.setAttribute('id', 'externCheck');

        var compCheck = document.createElement('input');
        compCheck.setAttribute('type','checkbox');
        compCheck.setAttribute('class', 'variableChooserCheckbox compCheck');
        compCheck.setAttribute('value', names[i]);
        compCheck.setAttribute('id', 'compCheck');

        modalDialog.appendChild(name);
        modalDialog.appendChild(coordCheck);
        modalDialog.appendChild(externCheck);
        modalDialog.appendChild(internCheck);
        modalDialog.appendChild(compCheck);
        modalDialog.appendChild(br);
    }

    modalDialog.appendChild(document.createElement('br'));
    modalDialog.appendChild(document.createElement('br'));

    okButton.setAttribute('onclick', 'getChooseVariableDialogCheckedBoxes()');
    cancelButton.setAttribute('onclick', 'hideModalDialog("div#chooseVariableDialog"); resetUploadFile();');
    modalDialog.appendChild(okButton);
    modalDialog.appendChild(cancelButton);
    $('div#chooseVariableDialog').show();
};

/*
 hides the modalDialog
 */
hideModalDialog = function(dialogID){
    $(dialogID).hide();
};

/*
 cleans the modalDialog
 */
cleanModalDialog = function(dialogID){
    var dialog = document.getElementById(dialogID);
    if(dialog != null && dialog.hasChildNodes()){
        dialog.innerHTML = '';
    }
};

showModalDialog = function(){
    $('div#modalDialog').show();
};

getChooseVariableDialogCheckedBoxes = function(){
    $('div.modalDialog').hide();
    var compCheckBoxes = document.getElementsByClassName('compCheck');
    var externCheckBoxes = document.getElementsByClassName('externCheck');
    var internCheckBoxes = document.getElementsByClassName('internCheck');
    var coordCheckBoxes = document.getElementsByClassName('coordCheck');

    var unchecked = [];
    var checkedCompVar = [];
    var checkedInternVar = [];
    var checkedExternVar = [];
    var checkedCoordVar = [];

    for(var i = 0; i < compCheckBoxes.length; i++){
        if(compCheckBoxes[i].checked){
            checkedCompVar.push(i+1);
        }
        if(externCheckBoxes[i].checked){
            checkedExternVar.push(i+1);
        }
        if(internCheckBoxes[i].checked){
            checkedInternVar.push(i+1);
        }
        if(coordCheckBoxes[i].checked){
            checkedCoordVar.push(i+1);
        }
        if(!(compCheckBoxes[i].checked || externCheckBoxes[i].checked || internCheckBoxes[i].checked || coordCheckBoxes[i].checked)){
            unchecked.push(i+1);
        }
    }

    cleanModalDialog();
    hideModalDialog();
    removeAllElementByClass('.checkbox');

    var variables = {
        unchecked: unchecked,
        compVar: checkedCompVar,
        coordVar: checkedCoordVar,
        internVar: checkedInternVar,
        externVar: checkedExternVar
    };

    Shiny.onInputChange('chosenVariables', variables);
};

createTable = function(tableId, data){
    cleanTable(tableId);
    dataVariablesNames = getNames(data);
    var table = document.getElementById(tableId);
    var columnNames = document.createElement('tr');

    for(var i = 0; i < dataVariablesNames.length; i++){
        var name = document.createElement('th');
        name.setAttribute('class', 'cell');
        name.innerHTML = dataVariablesNames[i];
        columnNames.appendChild(name);
    }
    table.appendChild(columnNames);
    for(var i = 0; i < data[dataVariablesNames[0]].length; i++){
        var row = document.createElement('tr');
        row.setAttribute('id','dataRow');
        for(var j = 0; j < dataVariablesNames.length; j++){
            var cell = document.createElement('td');
            if(data[dataVariablesNames[j]][i] != null){
                cell.innerHTML = data[dataVariablesNames[j]][i];
            }
            else{
                cell.innerHTML = "NA";
            }
            cell.setAttribute('class', 'cell');
            cell.setAttribute('value', '['+j+']['+i+']');
            row.appendChild(cell);
        }
        table.appendChild(row);
    }

    var settings = document.getElementById('settings');
    settings.setAttribute('onclick', 'createEditTableMenuDialog()');
    var edit = document.getElementById('edit');
    edit.setAttribute('onclick',' makeEditable()');

};

makeEditable = function(){
    var cells = document.getElementsByClassName('cell');
    if(editable){
        editable = false;
        popUpMessage("Edit-Mode is off!");
    }else{
        popUpMessage("Edit-Mode is on!");
        editable = true;
    }

    for(var i = 0; i < cells.length; i++){
        cells[i].contentEditable = editable;
    }
};

createEditTableMenuDialog = function(){
    modalDialog.setAttribute('id', 'editTableMenuDialog');
    cleanModalDialog('editTableMenuDialog');


    modalDialog.appendChild(addRowButton);
    modalDialog.appendChild(addColumnButton);
    modalDialog.appendChild(document.createElement('br'));
    modalDialog.appendChild(removeRowButton);
    modalDialog.appendChild(removeColumnButton);
    modalDialog.appendChild(document.createElement('br'));
    modalDialog.appendChild(editRowButton);
    modalDialog.appendChild(editColumnButton);
    $('div#editTableMenuDialog').show();
};

cleanTable = function(tableId){
    var table = document.getElementById(tableId);
    if(table != null){
        table.innerHTML = '';
        removeAllElementByClass('.cell')
    }
};

createTextFieldDialog = function(message){
    modalDialog.setAttribute('id', 'textFieldDialog');
    cleanModalDialog('textFieldDialog');

    var title = document.createElement('h4');
    title.innerHTML = message;

    var textField = document.createElement('input');
    textField.setAttribute('type', 'text');
    textField.setAttribute('class', 'textField');
    textField.setAttribute('id', 'editTextField');
    textField.setAttribute('value', 'Type...');

    modalDialog.appendChild(title);
    modalDialog.appendChild(document.createElement('br'));
    modalDialog.appendChild(textField);
    modalDialog.appendChild(document.createElement('br'));
//    okButton.setAttribute('onclick', okFunction);
    modalDialog.appendChild(okButton);
    cancelButton.setAttribute('onclick', '$("div#textFieldDialog").hide()');
    modalDialog.appendChild(cancelButton);

    var goBackButton = document.createElement('input');
    goBackButton.setAttribute('value', 'Go Back');
    goBackButton.setAttribute('type', 'button');
    goBackButton.setAttribute('class', 'btn');
    goBackButton.setAttribute('onclick', 'createEditTableMenuDialog()');
    goBackButton.setAttribute('id', 'buttonVariable');
    modalDialog.appendChild(goBackButton);

    $('div#textFieldDialog').show();
};

removeRow = function(){
    var textF = document.getElementById('editTextField');
    console.log("pula");
};

getNames = function(data){
    var names = [];
    for(var obj in data){
        names.push(obj);
    }
    return names;
};

getAllRPackagesName = function(packages){
    var names = [];
    for(var obj in packages){
        names.push(obj);
    }

    return names;
};

importDataFromR = function(){
    createSingleRadioDialog(allRPackages, 'getChosenPackage()');
};

createSingleRadioDialog = function(names, okFunction){
    modalDialog.setAttribute('id', 'radioDialog');
    cleanModalDialog('radioDialog');
    modalDialog.setAttribute('style', 'width: 300px');

    for(var i = 0; i < names.length; i++){

        var name = document.createElement('div');
        name.setAttribute('class', 'names');
        name.innerHTML = names[i];

        var radio = document.createElement('input');
        radio.setAttribute('type', 'radio');
        radio.setAttribute('class', 'radio');
        radio.setAttribute('name', 'radio');
        radio.setAttribute('value', names[i]);

        modalDialog.appendChild(name);
        modalDialog.appendChild(radio);
        modalDialog.appendChild(document.createElement("br"));
    }

    okButton.setAttribute('onclick', okFunction);
    modalDialog.appendChild(okButton);
    cancelButton.setAttribute('onclick', '$("div#radioDialog").hide(); resetUploadFile();');
    modalDialog.appendChild(cancelButton);

    $('div#radioDialog').show();
};

getChosenPackage = function(){
    var checked = getChosenRadio();
    cleanModalDialog('radioDialog');
    hideModalDialog('div#radioDialog');
    Shiny.onInputChange('chosenPackage', checked);
};

getChosenData = function(){
    var checked = getChosenRadio();
    cleanModalDialog('radioDialog');
    hideModalDialog('div#radioDialog');
    Shiny.onInputChange('chosenData', checked);
};

getChosenRadio = function(){
    var radios = document.getElementsByClassName('radio');
    var checked;

    for(var i = 0; i < radios.length; i++){
        if(radios[i].checked){
            checked = radios[i].value;
            cleanModalDialog();
            hideModalDialog();
            removeAllElementByClass('.radio');
            break;
        }
    }

    return checked;
};

removeAllElementByClass = function(className){
    $(className).remove();
};

popUpMessage = function(messageText){

    var message = document.createElement('h4');
    message.innerHTML = messageText;
    modalPopUp.appendChild(message);
    $('div#modalPopUp').show();

    setTimeout(function(){
        $('div#modalPopUp').hide();
        modalPopUp.innerHTML = '';
    },1000);
};

getChosenVariables = function(){
    Shiny.onInputChange('chosenVariables', getChooseVariableDialogCheckedBoxes());
    resetUploadFile();
};

getInsertedName = function(){
    var textF = document.getElementById('editTextField');
    hideModalDialog();
    Shiny.onInputChange('chosenName', textF.value);
};

resetUploadFile = function(){
    var uploadFile = document.getElementById('uploadFile');
    uploadFile.value = '';
    Shiny.onInputChange('chosenData', null);
    Shiny.onInputChange('chosenPackage', null);
};

createFileOptionDialog = function(message, fromFile){
    modalDialog.setAttribute('id', 'textFieldDialog');
    cleanModalDialog('textFieldDialog');
    modalDialog.setAttribute('style', 'width:500px;');

    var title = document.createElement('h4');
    title.innerHTML = "Upload File - Options";
    modalDialog.appendChild(title);
    modalDialog.appendChild(document.createElement('br'));

    var fileName = document.createElement('div');
    fileName.setAttribute('class', 'csvFileDialogDiv');
    fileName.innerHTML = "Filename:";
    modalDialog.appendChild(fileName);

    var fileNameTextField = document.createElement('input');
    fileNameTextField.setAttribute('type', 'text');
    fileNameTextField.setAttribute('class', 'textField');
    fileNameTextField.setAttribute('value', message);
    fileNameTextField.setAttribute('id', 'fileNameTextField');
    modalDialog.appendChild(fileNameTextField);
    modalDialog.appendChild(document.createElement('hr'));

    if(fromFile){
        var separator = document.createElement('div');
        separator.setAttribute('class', 'csvFileDialogDiv');
        separator.innerHTML = "Separator:";
        modalDialog.appendChild(separator);

        var separatorTextField = document.createElement('input');
        separatorTextField.setAttribute('type', 'text');
        separatorTextField.setAttribute('class', 'textField');
        separatorTextField.setAttribute('value', ';');
        separatorTextField.setAttribute('id', 'separatorTextField');
        modalDialog.appendChild(separatorTextField);
        modalDialog.appendChild(document.createElement('br'));

        var decimal = document.createElement('div');
        decimal.setAttribute('class', 'csvFileDialogDiv');
        decimal.innerHTML = "Decimal:";
        modalDialog.appendChild(decimal);

        var decimalTextField = document.createElement('input');
        decimalTextField.setAttribute('type', 'text');
        decimalTextField.setAttribute('class', 'textField');
        decimalTextField.setAttribute('value', '.');
        decimalTextField.setAttribute('id', 'decimalTextField');
        modalDialog.appendChild(decimalTextField);

        var quotes = document.createElement('div');
        quotes.setAttribute('class', 'csvFileDialogDiv');
        quotes.innerHTML = "Quotes:";
        modalDialog.appendChild(quotes);

        var quotesTextField = document.createElement('input');
        quotesTextField.setAttribute('type', 'text');
        quotesTextField.setAttribute('class', 'textField');
        quotesTextField.setAttribute('value', '"');
        quotesTextField.setAttribute('id', 'quotesTextField');
        modalDialog.appendChild(quotesTextField);
        modalDialog.appendChild(document.createElement('hr'));
    }
    var detectionLimit = document.createElement('div');
    detectionLimit.setAttribute('class', 'csvFileDialogDiv');
    detectionLimit.innerHTML = "Detection Limit:";
    modalDialog.appendChild(detectionLimit);

    var detectionLimitTextField = document.createElement('input');
    detectionLimitTextField.setAttribute('type', 'text');
    detectionLimitTextField.setAttribute('class', 'textField');
    detectionLimitTextField.setAttribute('value', '0.05');
    detectionLimitTextField.setAttribute('id', 'detectionLimitTextField');
    modalDialog.appendChild(detectionLimitTextField);
    modalDialog.appendChild(document.createElement('br'));

    var valueUnderDetectionLimit = document.createElement('div');
    valueUnderDetectionLimit.setAttribute('class', 'csvFileDialogDiv');
    valueUnderDetectionLimit.innerHTML = "Value for uDL:";
    modalDialog.appendChild(valueUnderDetectionLimit);

    var valueUnderDetectionLimitTextField = document.createElement('input');
    valueUnderDetectionLimitTextField.setAttribute('type', 'text');
    valueUnderDetectionLimitTextField.setAttribute('class', 'textField');
    valueUnderDetectionLimitTextField.setAttribute('value', '0');
    valueUnderDetectionLimitTextField.setAttribute('id', 'valueUnderDetectionLimitTextField');
    modalDialog.appendChild(valueUnderDetectionLimitTextField);

    var skip = document.createElement('div');
    skip.setAttribute('class', 'csvFileDialogDiv');
    skip.innerHTML = "Skip:";
    modalDialog.appendChild(skip);

    var skipTextField = document.createElement('input');
    skipTextField.setAttribute('type', 'text');
    skipTextField.setAttribute('class', 'textField');
    skipTextField.setAttribute('value', '0');
    skipTextField.setAttribute('id', 'skipTextField');
    modalDialog.appendChild(skipTextField);
    modalDialog.appendChild(document.createElement('hr'));

    if(fromFile){
        var header = document.createElement('div');
        header.setAttribute('class', 'csvFileDialogDiv');
        header.innerHTML = "Header";
        modalDialog.appendChild(header);

        var headerCheckbox = document.createElement('input');
        headerCheckbox.setAttribute('type', 'checkbox');
        headerCheckbox.setAttribute('class', 'csvFileDialogCheckbox');
        headerCheckbox.setAttribute('id', 'headerCheckbox');
        modalDialog.appendChild(headerCheckbox);

        var fill = document.createElement('div');
        fill.setAttribute('class', 'csvFileDialogDiv');
        fill.innerHTML = "Fill";
        modalDialog.appendChild(fill);

        var fillCheckbox = document.createElement('input');
        fillCheckbox.setAttribute('type', 'checkbox');
        fillCheckbox.setAttribute('id', 'fillCheckbox');
        fillCheckbox.setAttribute('class', 'csvFileDialogCheckbox');
        modalDialog.appendChild(fillCheckbox);
        modalDialog.appendChild(document.createElement('br'));
        modalDialog.appendChild(document.createElement('br'));

        var stripWhite = document.createElement('div');
        stripWhite.setAttribute('class', 'csvFileDialogDiv');
        stripWhite.innerHTML = "Strip White";
        modalDialog.appendChild(stripWhite);

        var stripWhiteCheckbox = document.createElement('input');
        stripWhiteCheckbox.setAttribute('type', 'checkbox');
        stripWhiteCheckbox.setAttribute('id', 'stripWhiteCheckbox');
        stripWhiteCheckbox.setAttribute('class', 'csvFileDialogCheckbox');
        modalDialog.appendChild(stripWhiteCheckbox);

        var stringAsFactors = document.createElement('div');
        stringAsFactors.setAttribute('class', 'csvFileDialogDiv');
        stringAsFactors.innerHTML = "String as factors";
        modalDialog.appendChild(stringAsFactors);

        var stringAsFactorsCheckbox = document.createElement('input');
        stringAsFactorsCheckbox.setAttribute('type', 'checkbox');
        stringAsFactorsCheckbox.setAttribute('id', 'stringAsFactorCheckbox');
        stringAsFactorsCheckbox.setAttribute('class', 'csvFileDialogCheckbox');
        modalDialog.appendChild(stringAsFactorsCheckbox);
        modalDialog.appendChild(document.createElement('br'));
        modalDialog.appendChild(document.createElement('hr'));
    }

    okButton.setAttribute('onclick', 'uploadFile(' + fromFile +')');
    cancelButton.setAttribute('onclick', 'hideModalDialog("div#textFieldDialog"); resetUploadFile();');
    modalDialog.appendChild(okButton);
    modalDialog.appendChild(cancelButton);
    var previewButton = document.createElement('input');
    previewButton.setAttribute('value', 'Preview');
    previewButton.setAttribute('type', 'button');
    previewButton.setAttribute('id', 'buttonVariable');
    previewButton.setAttribute('class', 'btn');
    previewButton.setAttribute('onclick', 'previewFile(' + fromFile + ')');
    modalDialog.appendChild(previewButton);

    showModalDialog();
};

uploadFile = function(fromFile){
    var options = getUploadOptions(fromFile);
    Shiny.onInputChange('uploadChosenFile', options);
    cleanModalDialog('textFieldDialog');
    hideModalDialog('div#textFieldDialog');
};

previewFile = function(fromFile){
    var options = getUploadOptions(fromFile);
    Shiny.onInputChange('preview', options);
};

getUploadOptions = function(fromFile){

    if(fromFile){
        return options = {
            name: document.getElementById('fileNameTextField').value,
            separator: document.getElementById('separatorTextField').value,
            decimal: document.getElementById('decimalTextField').value,
            quotes: document.getElementById('quotesTextField').value,
            detectionLimit: document.getElementById('detectionLimitTextField').value,
            valueUnderDetectionLimit: document.getElementById('valueUnderDetectionLimitTextField').value,
            skip: document.getElementById('skipTextField').value,
            header: document.getElementById('headerCheckbox').checked,
            fill: document.getElementById('fillCheckbox').checked,
            stripWhite: document.getElementById('stripWhiteCheckbox').checked,
            stringAsFactor: document.getElementById('stringAsFactorCheckbox').checked
        };
    }
    else{
        return options = {
            name: document.getElementById('fileNameTextField').value,
            detectionLimit: document.getElementById('detectionLimitTextField').value,
            valueUnderDetectionLimit: document.getElementById('valueUnderDetectionLimitTextField').value,
            skip: document.getElementById('skipTextField').value
        };
    }
};

createPreviewTable = function(data){

    $("img#xButton").show();
    cleanTable('previewTable');
    createTable('previewTable', data);
    $('div#previewTable').show();

    Shiny.onInputChange('preview', null);
};

plotSelectedNumber = function(value){
    label = document.getElementById('plotLabel');

    plotimg = document.createElement('img');
    plotimg.setAttribute('src', 'addPlot.png');
    label.appendChild(plotimg);
};
