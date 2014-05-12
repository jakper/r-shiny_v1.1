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
            cleanTable();
            createTable(data);
        });

    Shiny.addCustomMessageHandler('createSingleCheckboxDialog',
        function(names){
            cleanModalDialog();
            createSingleCheckboxDialog(names, 'getChosenVariables()');
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

            console.log(allData);
        }
    );

    Shiny.addCustomMessageHandler('allDataNames',
        function(message){
            allDataNames = message;

            console.log(allDataNames);
        }
    );
});

init = function(){
    body = document.getElementsByTagName('body')[0];
    modalDialog = document.createElement('div');
    modalDialog.setAttribute('class', 'modalDialog');
    body.appendChild(modalDialog);
    hideModalDialog();

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
    cancelButton.setAttribute('onclick', 'hideModalDialog()');

    var dataSelector = $('div#dataSelector')[0];
    dataSelector.contentEditable = false;
};

/*
 create a modalDialog with checkboxes
 */
createSingleCheckboxDialog = function(names, okFunction){

    modalDialog.setAttribute('id', 'checkboxDialog');

    for(var i = 0; i < names.length; i++){
        var br = document.createElement('br');

        var name = document.createElement('div');
        name.setAttribute('class', 'names');
        name.innerHTML = names[i];

        var check = document.createElement('input');
        check.setAttribute('type','checkbox');
        check.setAttribute('class', 'checkbox');
        check.setAttribute('value', names[i]);
        check.setAttribute('name', 'data');

        modalDialog.appendChild(name);
        modalDialog.appendChild(check);
        modalDialog.appendChild(br);
    }

    var selectAllButton = document.createElement('input');
    selectAllButton.setAttribute('value', 'Select All');
    selectAllButton.setAttribute('type', 'button');
    selectAllButton.setAttribute('id', 'buttonVariable');
    selectAllButton.setAttribute('class', 'btn');
    selectAllButton.setAttribute('onclick', 'changeAllCheckboxesState(true)');
    modalDialog.appendChild(selectAllButton);

    var selectNoneButton = document.createElement('input');
    selectNoneButton.setAttribute('value', 'Select None');
    selectNoneButton.setAttribute('type', 'button');
    selectNoneButton.setAttribute('id', 'buttonVariable');
    selectNoneButton.setAttribute('class', 'btn');
    selectNoneButton.setAttribute('onclick', 'changeAllCheckboxesState(false)')
    modalDialog.appendChild(selectNoneButton);

    modalDialog.appendChild(document.createElement('br'));
    modalDialog.appendChild(document.createElement('br'));

    okButton.setAttribute('onclick', okFunction);
    modalDialog.appendChild(okButton);
    modalDialog.appendChild(cancelButton);
    $('div.modalDialog').show();
};

/*
 hides the modalDialog
 */
hideModalDialog = function(){
    $('div.modalDialog').hide();
    cleanModalDialog();
};

/*
 cleans the modalDialog
 */
cleanModalDialog = function(){
    var dialog = document.getElementsByClassName('modalDialog')[0];
    if(dialog != null && dialog.hasChildNodes()){
        dialog.innerHTML = '';
    }
};

changeAllCheckboxesState = function(state){
    var checkboxes = document.getElementsByClassName("checkbox");
    for(var i = 0; i < checkboxes.length; i++){
        checkboxes[i].checked = state;
    }
};

getCheckedBoxes = function(){
    $('div.modalDialog').hide();
    var checkBoxes = document.getElementsByClassName('checkbox');
    var checked = [];

    for(var i = 0; i < checkBoxes.length; i++){
        if(!checkBoxes[i].checked){
            checked.push(i+1);
        }
    }

    cleanModalDialog();
    hideModalDialog();
    removeAllElementByClass('.checkbox');

    return checked;
};

createTable = function(){
    currentDataVariablesNames = getNames(currentData);
    var table = document.getElementById('dataTable');
    var columnNames = document.createElement('tr');

    for(var i = 0; i < currentDataVariablesNames.length; i++){
        var name = document.createElement('th');
        name.setAttribute('class', 'cell');
        name.innerHTML = currentDataVariablesNames[i];
        columnNames.appendChild(name);
    }
    table.appendChild(columnNames);
    for(var i = 0; i < currentData[currentDataVariablesNames[0]].length; i++){
        var row = document.createElement('tr');
        row.setAttribute('id','dataRow');
        for(var j = 0; j < currentDataVariablesNames.length; j++){
            var cell = document.createElement('td');
            cell.innerHTML = currentData[currentDataVariablesNames[j]][i];
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
    cleanModalDialog();
    modalDialog.setAttribute('id', 'editTableMenuDialog');

    addRowButton = document.createElement('input');
    addRowButton.setAttribute('value', 'Add Row');
    addRowButton.setAttribute('type', 'button');
    addRowButton.setAttribute('class', 'btn');
    addRowButton.setAttribute('id','editTableDialogButton');
    addRowButton.setAttribute('onclick', 'createTextFieldDialog("Type in the formula for the new row")');
    modalDialog.appendChild(addRowButton);

    addColumnButton = document.createElement('input');
    addColumnButton.setAttribute('value', 'Add Column');
    addColumnButton.setAttribute('type', 'button');
    addColumnButton.setAttribute('class', 'btn');
    addColumnButton.setAttribute('id','editTableDialogButton');
    addColumnButton.setAttribute('onclick', 'createTextFieldDialog("Type in the formula for the new column")'); //TODO insert nume
    modalDialog.appendChild(addColumnButton);

    modalDialog.appendChild(document.createElement('br'));

    removeRowButton = document.createElement('input');
    removeRowButton.setAttribute('value', 'Remove Row');
    removeRowButton.setAttribute('type', 'button');
    removeRowButton.setAttribute('class', 'btn');
    removeRowButton.setAttribute('id','editTableDialogButton');
    removeRowButton.setAttribute('onclick', 'createTextFieldDialog("Type in the row index(es)")');
    modalDialog.appendChild(removeRowButton);

    removeColumnButton = document.createElement('input');
    removeColumnButton.setAttribute('value', 'Remove Column');
    removeColumnButton.setAttribute('type', 'button');
    removeColumnButton.setAttribute('class', 'btn');
    removeColumnButton.setAttribute('id','editTableDialogButton');
    removeRowButton.setAttribute('onclick', 'createTextFieldDialog("Type in the column index(es)")');
    modalDialog.appendChild(removeColumnButton);

    modalDialog.appendChild(document.createElement('br'));

    editRowButton = document.createElement('input');
    editRowButton.setAttribute('value', 'Edit Row');
    editRowButton.setAttribute('type', 'button');
    editRowButton.setAttribute('class', 'btn');
    editRowButton.setAttribute('id','editTableDialogButton');
    editRowButton.setAttribute('onclick', 'createTextFieldDialog("Type in the formula for editing this row")');
    modalDialog.appendChild(editRowButton);

    editColumnButton = document.createElement('input');
    editColumnButton.setAttribute('value', 'Edit Column');
    editColumnButton.setAttribute('type', 'button');
    editColumnButton.setAttribute('class', 'btn');
    editColumnButton.setAttribute('id','editTableDialogButton');
    editColumnButton.setAttribute('onclick', 'createTextFieldDialog("Type in the formula for editing this column")');
    modalDialog.appendChild(editColumnButton);

    $('div.modalDialog').show();
};

cleanTable = function(){
    var table = document.getElementById('dataTable');
    table.innerHTML = '';
    removeAllElementByClass('.cell')
};

createTextFieldDialog = function(message){
    cleanModalDialog();
    modalDialog.setAttribute('id', 'textFieldDialog');

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
    modalDialog.appendChild(cancelButton);

    $('div.modalDialog').show();
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
    modalDialog.appendChild(cancelButton);

    $('div.modalDialog').show();
};

getChosenPackage = function(){
    var checked = getChosenRadio();
    Shiny.onInputChange('chosenPackage', checked);
};

getChosenData = function(){
    var checked = getChosenRadio();
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
    Shiny.onInputChange('chosenVariables', getCheckedBoxes());
};

getInsertedName = function(){
    var textF = document.getElementById('editTextField');
    hideModalDialog();
    Shiny.onInputChange('chosenName', textF.value);
};

resetUploadFile = function(){
    var uploadFile = document.getElementById('uploadFile');
    uploadFile.value = '';
};

plotsNumberSelected = function(value){
  console.log(value);
};