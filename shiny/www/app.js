/**********************************************************************************
 ******************************* GLOBAL VARIABLES *********************************
 **********************************************************************************
 ******************************** DATA VARIABLES **********************************
 *********************************************************************************/
var allData;
var currentVariablesGroupName;
var currentVariablesGroup = [];
var typeOfSelectedVariableGroup;
var currentSubset = [];
var currentSubsetName;
var currentData = {
    names: null,
    data: null,
    compositions: null,
    externals: null,
    coords: null,
    ids: null,
    transformations: null,
    subsets: null,
    variablesTypes: null,
    nas: null,
    ldl: null,
    udl: null,
    gemasInfo: null
};

/***********************************************************************************
 ********************************* HTML-OBJECTS ************************************
 **********************************************************************************/
var body;
var modalPopUp;
var modalDialog;
var missingValuesMethodsContainer;
var nasInfoWell;
var detectionLimitMethodContainer;
var detectionLimitInfoWell;
/**********************************************************************************
 ************************************** BUTTONS ***********************************
 *********************************************************************************/
var okButton;
var cancelButton;
var missingValuesOkButton;


/**********************************************************************************
 *************************************** MISC *************************************
 *********************************************************************************/
var allDataNames;
var allRPackages;
var nrComps;
var nrExterns;
var nrCoords;
var nrIDs;

/**********************************************************************************
 *********************************** STATIC VARIABLES *****************************
 *********************************************************************************/
var isNumber = /^-?\d*\.?,?\d*$/;
var gemasInfoNames = ["HEADER", "COMMENT DATASET", "SAMPLE IDENTIFIER", "COORDINATES", "VARIABLE", "UNIT", "EXTRACTION",
    "METHOD", "UDL", "LDL", "COMMENT VARIABLES"];
var missingValuesComposition = {
    impCoda: {
        maxit: ["Maximum Number Of Iterations", "3"],
        method: ["Method","ltsReg", "ltsReg2", "lm", "classical"]
    },
    impKNNa: {
        k: ["Number Of Nearest Neighbors", "5"]
    }
};
var missingValuesNonComposition = {
    kNN: {
        k: ["Number Of Nearest Neighbors", "5"]
    },
    irmi: {}
};
var detectionLimitCompositions = {
    impRZilr: {
        method: ["Method", "lm", "MM", "pls"]
    },
    replaceValuesSmallerDL:{
        constant: ["Replace With Constant * DL", "1/2", "1/3"]
    }
};
var detectionLimitNonCompositions = {
    replaceValuesSmallerDL:{
        constant: ["Replace With Constant * DL", "1/2", "1/3"]
    }
};
var transformationsCompositions = {
    addLR: {
        ivar: ["Rationing Variable Name"]
    },
    cenLR: {},
    isomLR: {},
    command: {
        command: ["Command"]
    }
};
var plotColors = ['rgba(0,0,139, .5)','rgba(255,99,71, .5)' ,'rgba(255,140,0,.5)' ,'rgba(128,128,0, .5)' ,'rgb(0,255,0, .5)','rgba(119, 152, 191, .5)',
    'rgba(186,85,211, .5)', 'rgba(160,82,45,.5)', 'rgba(112,128,144,.5)', 'rgba(255,215,0,.5)', 'rgba(205,92,92,.5)', 'rgba(220,20,60, .5)',
    'rgb(152,251,152,.5)', 'rgb(143,188,143,.5)'];
var pcaCompositions = {
    pcaCoDa: {
        method: ["Method", "robust", "standard"]
    }
};
var pcaNonCompositions = {
    princomp: {
        method: ["Method", "robust", "standard"],
        cor: ["Correlation", "false", "true"]
    }
};
var pfaCompositions = {
    pfa: {
        factors: ["Factors"],
        covmat: ["covmat", "cov", "covMcd"]
    }
};
var pfaNonCompositions = {
    pfa: {
        factors: ["Factors"],
        scores: ["Scores", "regression", "Bartlett", "none"],
        rotation: ["Rotation", "varimax", "none"]
    }
};
var cluster = {
    hclust: {
        method: ["Method", "single", "complete", "average"]
    },
    Mclust: {},
    kmeans: {
        centers: ["# clusters"]
    },
    cmeans: {
        centers: ["# clusters"]
    }
};
var regression = {
    lm: {
        x: ["transformed data"],
        y: ["variable"]
    },
    lmRob: {
        x: ["transformed data"],
        y: ["variable"]
    }
};
var discriminant = {
    lda : {

    },
    qda: {

    }
};

$(document).ready(function(){

    initElements();

    Shiny.addCustomMessageHandler('createDataSelector',
        function(names){
            allDataNames = names;
            createDataSelector(names);
        });

    Shiny.addCustomMessageHandler('renderDataInformation',
        function(data){
            currentData = data;
            renderDataInformation();
        });

    Shiny.addCustomMessageHandler('createChooseVariableDialog',
        function(data){
            createChooseVariableDialog(data.data, data.names);
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

    Shiny.addCustomMessageHandler('setSelectorsValue',
        function(names){
            setSelectorsValue(names);
        }
    );

    Shiny.addCustomMessageHandler('resetConnector',
        function(connectorName){
            Shiny.onInputChange(connectorName, null);
        }
    );

    Shiny.addCustomMessageHandler('plotBarPlot',
        function(data){
            createVariablesBarPlotSeries(data);
        });

    Shiny.addCustomMessageHandler('plotGroupBarPlot',
        function(data){
            createGroupBarPlotSeries(data);
        });

    Shiny.addCustomMessageHandler('plotBoxPlot',
        function(data){
            createBoxPlotSeries(data);
        }
    );
	Shiny.addCustomMessageHandler('pcaPlot',
        function(data){
            createPcaPlot(data);
        }
    );
});

initElements = function(){
    body = document.getElementsByTagName('body')[0];
    missingValuesMethodsContainer = document.getElementById('missingValuesWell');
    nasInfoWell = document.getElementById('nasWell');
    detectionLimitMethodContainer = document.getElementById('detectionLimitWell');
    detectionLimitInfoWell = document.getElementById('infoWell');

    body.appendChild(createDiv('backgroundDiv', '', ''));

    hideElement('#0');
    hideElement('#plus0');
    createGlobalModals();
    createGlobalButtons();
    createGlobalImages();
    deleteUploadProgressBars();
};

// various functions
/*
 i've named the method createGlobalButtons because this are buttons that are
 needed everywhere
 */
createGlobalModals = function(){
    modalDialog = createDiv('modalDialog', 'modalDialog', '');
    body.appendChild(modalDialog);
    hideElement('div#modalDialog');

    modalPopUp = createDiv('', 'modalPopUp', '');
    body.appendChild(modalPopUp);
    hideElement('div#modalPopUp');

    var previewTable = createDiv('table table-bordered table-condensed', 'previewTable');
    body.appendChild(previewTable);
    hideElement('div#previewTable');

};

createGlobalButtons = function(){
    okButton = createButton('btn', 'buttonVariable', 'OK');
    cancelButton = createButton('btn', 'buttonVariable', 'Cancel');
    missingValuesOkButton = createButton('btn', 'buttonVariable', 'OK', 'getChosenImputationMethod()');
};

createGlobalImages = function(){
    body.appendChild(createImage('', 'loading', 'load.gif'));
    hideElement('img#loading');

    $('body').bind('loading.start', function(ev){
        showElement('img#loading');
        $('.backgroundDiv').height(getMaxHeight()).show();
    });

    $('body').bind('loading.end', function(ev){
        hideElement('img#loading');
        $('.backgroundDiv').hide();
    });

    body.appendChild(createImage('', 'xButton', 'xButton.png','hideElement("div#previewTable"); hideElement("img#xButton")'));
    hideElement('img#xButton');
};

deleteUploadProgressBars = function(){
    $("div#uploadCSVFile_progress").remove();
    $("div#uploadRData_progress").remove();
};

Array.prototype.unique = function() {
    var a = this.concat();
    for(var i=0; i<a.length; ++i) {
        for(var j=i+1; j<a.length; ++j) {
            if(a[i] === a[j])
                a.splice(j--, 1);
        }
    }

    return a;
};

getAllIndexes = function(arr, val) {
    var indexes = [], i = -1;
    while ((i = arr.indexOf(val, i+1)) != -1){
        indexes.push(i);
    }
    return indexes;
};

getMaxHeight = function(){
    var maxHeight = Math.max.apply(null, $("body").map(function ()
    {
        return $(this).height();
    }).get());

    return Math.max(window.innerHeight, maxHeight, ($('.modalDialog').height() + 50));
};

// this function inserts newNode after referenceNode
insertAfter = function(referenceNode, newNode){
    referenceNode.parentNode.insertBefore( newNode, referenceNode.nextSibling );
};

renderDataInformation = function(){
    createVariableGroupSelector();
    createSubsetSelector();
    renderDataMethodsInformation();
};

renderDataMethodsInformation = function(){
    $('body').trigger('loading.start');
    setTimeout(function(){
        createMissingValuesDialog();
        createDetectionLimitDialog();
        createTransformationsDialog();
        createDefineObservationsGroupDialog();
        createPCADialog();
        createPFADialog();
        createDADialog();
        createClusterAnalysisDialog();
        createODDialog();
		createRegressionDialog();
        if(currentVariablesGroupName == "allGroups"){
            createTable('dataTable', currentData.names, currentData.data);
            createNAsInfo(currentData.names, currentData.nas);
            createDefineVariablesGroupDialog(currentData.names);
            if(currentData.ldl != null && currentData.udl != null){createDetectionLimitInfoWell(currentData.names, currentData.udl, currentData.ldl);}
            else if(currentData.udl != null){createDetectionLimitInfoWell(currentData.names, currentData.udl, null);}
            else if(currentData.ldl != null){createDetectionLimitInfoWell(currentData.names, null, currentData.ldl);}

        }
        else{
            var tempNames;
            var tempData;
            if(typeOfSelectedVariableGroup == 'transformations'){
                tempNames = getNames(currentVariablesGroup);
                tempData = currentVariablesGroup;
            }else{
                tempData = currentData.data;
                tempNames = getDataFromGivenIndexes(currentData.names, currentVariablesGroup);
            }
            createDefineVariablesGroupDialog(tempNames);
            createTable('dataTable', tempNames, tempData);
            createNAsInfo(tempNames, getDataFromGivenIndexes(currentData.nas, currentVariablesGroup));
            if(currentData.ldl != null && currentData.udl != null){createDetectionLimitInfoWell(tempNames,
                getDataFromGivenIndexes(currentData.udl, currentVariablesGroup),
                getDataFromGivenIndexes(currentData.ldl, currentVariablesGroup));}
            else if(currentData.udl != null){createDetectionLimitInfoWell(tempNames, getDataFromGivenIndexes(currentData.udl, currentVariablesGroup), null);}
            else if(currentData.ldl != null){createDetectionLimitInfoWell(tempNames, null, getDataFromGivenIndexes(currentData.ldl, currentVariablesGroup));}
        }
        $('body').trigger('loading.end');
    }, 5000);
};

popUpMessage = function(messageText){

    modalPopUp.appendChild(createH4Title(messageText));
    showElement('div#modalPopUp');
    showElement('.backgroundDiv');
    setTimeout(function(){
        if($('.modalDialog:hidden').length > 0){
            hideElement('.backgroundDiv');
        }
        hideElement('div#modalPopUp');
        modalPopUp.innerHTML = '';
    },3500);
};

getNames = function(data){
    var names = [];
    for(var obj in data){
        names.push(obj);
    }
    return names;
};

getValuesFromObject = function(object){
    return Object.keys(object).map(function(key){return object[key];});
};

getDataFromGivenIndexes = function(data, indexes){
    var obj = [];
    for(var i = 0; i < indexes.length; i++){
        obj[i] = data[indexes[i]];
    }

    return obj;
};

removeAllElementByClass = function(className){
    $(className).remove();
};

// show / hide functions
hideElement = function(elemID){
    $(elemID).hide();
};

showElement = function(elemID){
    $(elemID).show();
};

// clean functions

cleanModalDialog = function(dialogID){
    var dialog = document.getElementById(dialogID);
    if(dialog != null && dialog.hasChildNodes()){
        dialog.innerHTML = '';
    }
};

cleanTable = function(tableID){
    var table = document.getElementById(tableID);
    if(table != null){
        table.innerHTML = '';
        removeAllElementByClass('.cell')
    }
};

/**********************************************************************************
 ************************** CREATE HTML-OBJECTS - FUNCTIONS ***********************
 *********************************************************************************/

createBr = function(){
    return document.createElement('br');
};

createHr = function(){
    return document.createElement('hr');
};

createH4Title = function(titleText){
    var title = document.createElement('h4');
    title.innerHTML = titleText;

    return title
};

createOption = function(optionClass, value, innerHTML){
    var option = document.createElement('option');
    option.setAttribute('class', optionClass);
    option.setAttribute('value', value);
    option.innerHTML = innerHTML;

    return option;
};

createDiv = function(divClass, id, innerHTML, onclickFunction){
    var div = document.createElement('div');
    div.setAttribute('class', divClass);
    div.setAttribute('id', id);
    div.setAttribute('onclick', onclickFunction);
    div.innerHTML = innerHTML;

    return div;
};

createSelect = function(selectClass, id){
    var select = document.createElement('select');
    select.setAttribute('class', selectClass);
    select.setAttribute('id', id);

    return select;
};

createCheckBox = function(checkBoxClass, id, value){
    var checkBox = document.createElement('input');
    checkBox.setAttribute('type', 'checkbox');
    checkBox.setAttribute('class', checkBoxClass);
    checkBox.setAttribute('id', id);
    checkBox.setAttribute('value', value);

    return checkBox;
};

createRadio = function(radioClass, id, value, name){
    var radio = document.createElement('input');
    radio.setAttribute('type', 'radio');
    radio.setAttribute('class', radioClass);
    radio.setAttribute('id', id);
    radio.setAttribute('value', value);
    radio.setAttribute('name', name);

    return radio;
};

createImage = function(imageClass, id, src, onclickFunction){
    var image = document.createElement('img');
    image.setAttribute('class', imageClass);
    image.setAttribute('id', id);
    image.setAttribute('src', src);
    image.setAttribute('onclick', onclickFunction);

    return image;
};

createTextField = function(textFieldClass, id, value){
    var textField = document.createElement('input');
    textField.setAttribute('type', 'text');
    textField.setAttribute('class', textFieldClass);
    textField.setAttribute('id', id);
    textField.setAttribute('value', value);

    return textField;
};

createButton = function(buttonClass, id, value, onclickFunction){
    var button = document.createElement('input');
    button.setAttribute('type', 'button');
    button.setAttribute('class', buttonClass);
    button.setAttribute('id', id);
    button.setAttribute('value', value);
    button.setAttribute('onclick', onclickFunction);

    return button;
};

createAddButton = function(id, onclick){
    var addButton = createDiv('tableinput-plusrow variablesTypeAddButton', id, '', onclick);
    var icon = document.createElement('i');
    icon.setAttribute('class', 'icon-plus-sign');
    addButton.appendChild(icon);
    return addButton;
};

createPropertiesAndEvents  = function(textFieldClass, id){
	var pre =document.createElement("PRE");
    pre.setAttribute('class', textFieldClass);
    pre.setAttribute('id', id);
	return pre;
};

/**********************************************************************************
 *********************************** DATA *****************************************
 **********************************************************************************
 ******************************* SELECTORS ****************************************
 *********************************************************************************/
createDataSelector = function(names){
    var selector = document.getElementById('dataSelector');
    selector.innerHTML = '';
    for(var i = 0; i < names.length; i++){
        var option = createOption('' + names[i], '' + names[i], '' + names[i]);
        selector.appendChild(option);
    }
    selector.selectedIndex = names.length - 1;
    selectedDataSet(selector.value);
};

createVariableGroupSelector = function(){
    var selector = document.getElementById('variableGroupSelector');
    selector.innerHTML = '';
    var names = {};
    names["compositions"] = getNames(currentData.compositions);
    names["externals"] = getNames(currentData.externals);
    names["coords"] = getNames(currentData.coords);
    names["ids"] = getNames(currentData.ids);
    names["transformations"] = getNames(currentData.transformations);

    var allGroupsOption = createOption('allGroups', 'allGroups', 'all groups');
    currentVariablesGroupName = "allGroups";
    typeOfSelectedVariableGroup = "allGroups";
    currentVariablesGroup = [];
    selector.appendChild(allGroupsOption);

    for(var obj in names){
        for(var i = 0; i < (names[obj]).length; i++){
            var option = createOption('' + obj, '' + names[obj][i], '' + names[obj][i]);
            selector.appendChild(option);
        }
    }
};

createSubsetSelector = function(){
    var selector = document.getElementById('subsetSelector');
    selector.innerHTML = '';
    var names = getNames(currentData.subsets);
    currentSubsetName = 'allSubsets';
    currentSubset = [];
    selector.appendChild(createOption('', 'allSubsets', 'allSubsets'));
    for(var i = 0; i < names.length; i++){
        selector.appendChild(createOption('', names[i], names[i]));
    }

};

/*
 selectors-functionality
 */
selectedDataSet = function(value){
    if(plotContainerParent != null){
        plotContainerParent.innerHTML = "";
        createPlotContainer();
    }
    Shiny.onInputChange('dataSelectorChosenData', value);
};

selectedVariableGroup = function(selectedOptions, render){
    var option = selectedOptions[0];
    typeOfSelectedVariableGroup = option.className;
    currentVariablesGroupName = option.value;
    if(currentVariablesGroupName != 'allGroups'){
        if(typeOfSelectedVariableGroup == 'transformations'){
            currentVariablesGroup = currentData[option.className][option.value];
        }else{
            currentVariablesGroup = getValuesFromObject(currentData[option.className][option.value]);
        }
    }
    else{
        currentVariablesGroup = [];
    }
    if(render === undefined){
        renderDataMethodsInformation();
    }
};

selectedSubset = function(selectedOptions){
    var option = selectedOptions[0];
    currentSubsetName = option.value;
    if(currentSubsetName != 'allSubsets'){
        currentSubset = getValuesFromObject(currentData.subsets[currentSubsetName]);
    }else{
        currentSubset = [];
    }

    renderDataMethodsInformation();
};

setSelectorsValue = function(value){
    var dataSelector = document.getElementById('dataSelector');
    var children = dataSelector.children;
    for(var i = 0; i < children.length; i++){
        if(children[i].value == value.fileName){
            dataSelector.selectedIndex = i;
            break;
        }
    }

    var variableGroupSelector = document.getElementById('variableGroupSelector');
    children = variableGroupSelector.children;
    for(i = 0; i < children.length; i++){
        if(children[i].value == value.groupName){
            variableGroupSelector.selectedIndex = i;
            break;
        }
    }

    var subsetSelector = document.getElementById('subsetSelector');
    children = subsetSelector.children;
    for(i = 0; i < children.length; i++){
        if(children[i].value == value.subsetName){
            subsetSelector.selectedIndex = i;
            break;
        }
    }

    selectedVariableGroup(variableGroupSelector.selectedOptions, false);
    selectedSubset(subsetSelector.selectedOptions);
    resetDataSelector();
};

setVariablesGroupSelectorValue = function(value){
    var variableGroupSelector = document.getElementById('variableGroupSelector');
    var children = variableGroupSelector.children;
    for(var i = 0; i < children.length; i++){
        if(children[i].value == value){
            variableGroupSelector.selectedIndex = i;
            break;
        }
    }

    selectedVariableGroup(variableGroupSelector.selectedOptions);
};

setSubsetSelectorValue = function(value){
    var subsetSelector =  document.getElementById('subsetSelector');
    var children = subsetSelector.children;
    for(var i = 0; i < children.length; i++){
        if(children[i].value == value){
            subsetSelector.selectedIndex = i;
            break;
        }
    }

};

getTypeOfDataSetVariable = function(variable){
    if(variable == "true" || variable == "TRUE" || variable == "false" || variable == "FALSE"){
        return "logical";
    }
    else if(isNumber.test(variable)){
        return "numeric";
    }
    else if(variable == ""){
        return "numeric";
    }
    else{
        return "character";
    }
};

// creates a dialog from where the user chooses the variables from the data set
createChooseVariableDialog = function(data, names){

    $('body').trigger('loading.start');
    setTimeout(function(){
        modalDialog.setAttribute('id', 'chooseVariableDialog');
        modalDialog.setAttribute('style', 'width: 750px; overflow:auto;');
        modalDialog.appendChild(createH4Title('Choose Variables'));

        var container = createDiv('','variablesContainer','');

        var namesDiv = createDiv('variablesDiv', 'namesDiv', '');
        var typeDiv = createDiv('variablesDiv', 'typeDiv', '');
        var comp1Div = createDiv('variablesDiv', '', '');
        var extern1Div = createDiv('variablesDiv', '', '');
        var coord1Div = createDiv('variablesDiv', '', '');
        var id1Div = createDiv('variablesDiv', '', '');

        okButton.setAttribute('onclick', 'getChooseVariableDialogCheckedBoxes(); resetUploadFile();');
        cancelButton.setAttribute('onclick', 'hideElement("div#chooseVariableDialog"); resetUploadFile(); $(".backgroundDiv").hide();');

        namesDiv.appendChild(createDiv('variablesType', 'variablesNames', 'Variables'));
        typeDiv.appendChild(createDiv('variablesType', 'variablesType', 'Type'));
        comp1Div.appendChild(createDiv('variablesType', 'comp1', 'comp1'));
        extern1Div.appendChild(createDiv('variablesType', 'extern1', 'extern1'));
        coord1Div.appendChild(createDiv('variablesType', 'coord1', 'coord1'));
        id1Div.appendChild(createDiv('variablesType', 'id1', 'id1'));

        container.appendChild(namesDiv);
        container.appendChild(typeDiv);
        container.appendChild(comp1Div);
        container.appendChild(createAddButton('addCompButton', 'addNewVariableType("variablesContainer", "addCompButton", "comp");'));
        container.appendChild(extern1Div);
        container.appendChild(createAddButton('addExternButton', 'addNewVariableType("variablesContainer", "addExternButton", "extern");'));
        container.appendChild(coord1Div);
        container.appendChild(createAddButton('addCoordButton', 'addNewVariableType("variablesContainer", "addCoordButton", "coord");'));
        container.appendChild(id1Div);
        container.appendChild(createAddButton('addIdButton', 'addNewVariableType("variablesContainer", "addIdButton", "id");'));

        modalDialog.appendChild(container);
        modalDialog.appendChild(createBr());
        modalDialog.appendChild(okButton);
        modalDialog.appendChild(cancelButton);

        for(var i = 0; i < names.length; i++){
            var variableTypeSelector = createSelect('variableTypeSelector', names[i] + 'TypeSelector');

            variableTypeSelector.appendChild(createOption('', 'character', 'character'));
            variableTypeSelector.appendChild(createOption('', 'numeric', 'numeric'));
            variableTypeSelector.appendChild(createOption('', 'logical', 'logical'));
            variableTypeSelector.appendChild(createOption('', 'factor', 'factor'));

            var varType = getTypeOfDataSetVariable(data[names[i]][data[names[i]].length/2]);
            if(varType == 'numeric'){
                variableTypeSelector.selectedIndex = 1;
            }
            else if(varType == 'logical'){
                variableTypeSelector.selectedIndex = 2;
            }

            var nameCont = createDiv('variableChooserNameContainer', '', '');
            nameCont.appendChild(createDiv('names', '',  names[i]));
            namesDiv.appendChild(nameCont);
            namesDiv.appendChild(createBr());

            typeDiv.appendChild(variableTypeSelector);

            var comp1Cont = createDiv('variableChooserCheckBoxContainer', '', '');
            comp1Cont.appendChild(createCheckBox('variableChooserCheckbox comp1Check', 'comp1Check', names[i]));
            comp1Div.appendChild(comp1Cont);
            comp1Div.appendChild(createBr());

            var extern1Cont = createDiv('variableChooserCheckBoxContainer', '', '');
            extern1Cont.appendChild(createCheckBox('variableChooserCheckbox extern1Check', 'extern1Check', names[i]));
            extern1Div.appendChild(extern1Cont);
            extern1Div.appendChild(createBr());

            var coord1Cont = createDiv('variableChooserCheckBoxContainer', '', '');
            coord1Cont.appendChild(createCheckBox('variableChooserCheckbox coord1Check', 'coord1Check', names[i]));
            coord1Div.appendChild(coord1Cont);
            coord1Div.appendChild(createBr());

            var id1Cont = createDiv('variableChooserCheckBoxContainer', '', '');
            id1Cont.appendChild(createCheckBox('variableChooserCheckbox id1Check', 'id1Check', names[i]));
            id1Div.appendChild(id1Cont);
            id1Div.appendChild(createBr());
        }

        comp1Div.appendChild(createImage('checkAll', 'comp1CheckAll', 'checkAll.png', 'selectAllCheckBoxes("comp1Check")'));
        comp1Div.appendChild(createBr());
        comp1Div.appendChild(createBr());
        extern1Div.appendChild(createImage('checkAll', 'extern1CheckAll', 'checkAll.png', 'selectAllCheckBoxes("extern1Check")'));
        extern1Div.appendChild(createBr());
        extern1Div.appendChild(createBr());
        coord1Div.appendChild(createImage('checkAll', 'coord1CheckAll', 'checkAll.png', 'selectAllCheckBoxes("coord1Check")'));
        coord1Div.appendChild(createBr());
        coord1Div.appendChild(createBr());
        id1Div.appendChild(createImage('checkAll', 'id1CheckAll', 'checkAll.png', 'selectAllCheckBoxes("id1Check")'));
        id1Div.appendChild(createBr());
        id1Div.appendChild(createBr());

        comp1Div.appendChild(createTextField('variablesTypeTextField comp1TextField', 'comp1TextField', 'comp1'));
        extern1Div.appendChild(createTextField('variablesTypeTextField extern1TextField', 'extern1TextField', 'extern1'));
        coord1Div.appendChild(createTextField('variablesTypeTextField coord1TextField', 'coord1TextField', 'coord1'));
        id1Div.appendChild(createTextField('variablesTypeTextField id1TextField', 'id1TextField', 'id1'));

        $('#variablesContainer').width(750);
        $('div#chooseVariableDialog').show();
        $('.backgroundDiv').height(getMaxHeight()).show();

        nrComps = 1;
        nrCoords = 1;
        nrExterns = 1;
        nrIDs = 1;
        $('body').trigger('loading.end');
        $('.backgroundDiv').show();
    },5000);
};

updateVariablesContainerWidth = function(){
    var variablesDivCount = $('.variablesDiv').length;
    $('#variablesContainer').width(variablesDivCount * 250);
};

// adds a new column a checkboxes (comp, coord, extern, id), depending on the parameters
addNewVariableType = function(containerID, insertBefore, type){
    var nr;

    if(type == "comp"){
        nrComps++;
        nr = nrComps;
    }
    else if(type == "coord"){
        nrCoords++;
        nr = nrCoords;
    }
    else if(type == "extern"){
        nrExterns++;
        nr = nrExterns;
    }
    else{
        nrIDs++;
        nr = nrIDs;
    }

    var elem = document.getElementById(insertBefore);
    var container = document.getElementById(containerID);
    var variablesDiv = createDiv('variablesDiv', '', '');
    variablesDiv.appendChild(createDiv('variablesType', type+nr, type+nr));

    var checks = document.getElementsByClassName(type+(nr-1)+'Check');
    for(var i = 0; i < checks.length; i++){
        var checkCont = createDiv('variablesChooserNameContainer', '', '');
        checkCont.appendChild(createCheckBox('variableChooserCheckbox '+ type + nr + 'Check', type + nr + 'Check', checks[i].value));
        variablesDiv.appendChild(checkCont);
        variablesDiv.appendChild(createBr());
    }
    variablesDiv.appendChild(createImage('checkAll', type + nr + 'CheckAll', 'checkAll.png', 'selectAllCheckBoxes('+type + nr + "Check"+')'));
    variablesDiv.appendChild(createBr());
    variablesDiv.appendChild(createBr());
    variablesDiv.appendChild(createTextField('variablesTypeTextField ' + type + nr + 'TextField', type + nr + 'TextField', type + nr));
    container.insertBefore(variablesDiv, elem);
    updateVariablesContainerWidth();
};

// selects all checkboxes with the given class
selectAllCheckBoxes = function(checkBoxesClass){
    var checkBoxes;

    if(typeof  checkBoxesClass == "string"){
        checkBoxes = document.getElementsByClassName(checkBoxesClass);
    }else{
        checkBoxes = checkBoxesClass;
    }

    for(var i = 0; i < checkBoxes.length; i++){
        checkBoxes[i].checked = true;
    }
};

//gets the checked checkboxes form the dialog
getChooseVariableDialogCheckedBoxes = function(){

    var variables = {};
    var type = [];
    var variablesTypes = document.getElementsByClassName('variableTypeSelector');
    var checkBoxes = document.getElementsByClassName('variableChooserCheckbox');
    var textFields = document.getElementsByClassName("variablesTypeTextField");
    var observations = checkBoxes.length/textFields.length;

    for(var i = 0; i < textFields.length; i++){
        if(textFields[i].value == "" || textFields[i].value == " "){
            popUpMessage("Empty textfield!");
            return;
        }
    }

    for(var column = 0; column < textFields.length; column++){
        var checked = [];
        var checkBoxIndex = column * observations;
        for(var observationIndex = checkBoxIndex; observationIndex < checkBoxIndex + observations; observationIndex++){
            if(checkBoxes[observationIndex].checked){
                checked.push(observationIndex % observations);
            }
        }
        variables[textFields[column].value] = checked;

        if(!((textFields[column].id).indexOf('id') === -1)){
            type.push('id');
        }
        else if(!((textFields[column].id).indexOf('comp') === -1)){
            type.push('comp');
        }
        else if(!((textFields[column].id).indexOf('extern') === -1)){
            type.push('extern');
        }
        else{
            type.push('coord');
        }
    }

    var variablesTypesValue = [];
    for(i = 0; i < variablesTypes.length; i++){
        variablesTypesValue.push(variablesTypes[i].value);
    }
    variables["variablesTypes"] = variablesTypesValue;
    variables["type"] = type;

    cleanModalDialog();
    removeAllElementByClass('.variableChooserCheckbox');
    removeAllElementByClass('.variablesTypeTextField');
    $('div.modalDialog').hide();
    $('.backgroundDiv').hide();

    Shiny.onInputChange('chosenVariables', variables);
};

createTable = function(tableId, dataVariablesNames, data, info){

    cleanTable(tableId);

    var table = document.getElementById(tableId);
    var columnNames = document.createElement('tr');

    if(info != null){
        for(i = 0; i < gemasInfoNames.length; i++){
            row = document.createElement('tr');
            row.setAttribute('id','dataRow');
            var gemasInfoRow = info[gemasInfoNames[i]];
            for(j = -1; j < dataVariablesNames.length; j++){
                var cell;
                if(j == -1){
                    cell = document.createElement('th');
                    cell.innerHTML = gemasInfoNames[i];
                }
                else{
                    cell = document.createElement('td');
                    if(gemasInfoRow == null || gemasInfoRow[j] == null){
                        cell.innerHTML = '';
                    }
                    else{
                        cell.innerHTML = gemasInfoRow[j];
                    }
                }

                cell.setAttribute('class', 'cell');
                row.appendChild(cell);
            }

            table.appendChild(row);
        }
    }

    for(i = -1; i < dataVariablesNames.length; i++){

        if(info == null && i == -1){i = 0;}

        var name = document.createElement('th');
        name.setAttribute('class', 'cell');
        if(i > -1){
            name.innerHTML = dataVariablesNames[i];
        }
        else{
            name.innerHTML = ''
        }
        name.setAttribute('style','text-align:center;');
        columnNames.appendChild(name);
    }
    table.appendChild(columnNames);

    var rowsNr;
    if(currentSubset.length == 0){
        rowsNr = data[dataVariablesNames[0]].length;
    }else{
        rowsNr = currentSubset.length;
    }

    for(var i = 0; i < rowsNr; i++){

        var row = document.createElement('tr');
        row.setAttribute('id','dataRow');

        for(var j = -1; j < dataVariablesNames.length; j++){
            if(info == null && j == -1){j = 0;}

            cell = document.createElement('td');

            if(j == -1){
                cell.innerHTML = "";
            }
            else{
                if(data[dataVariablesNames[j]][i] != null){
                    if(currentSubset.length == 0){
                        cell.innerHTML = data[dataVariablesNames[j]][i];
                    }else{
                        cell.innerHTML = data[dataVariablesNames[j]][currentSubset[i]]
                    }
                }
                else{
                    cell.innerHTML = "NA";
                }
            }

            cell.setAttribute('class', 'cell');
            cell.setAttribute('value', '['+j+']['+i+']');
            cell.setAttribute('style','text-align:center;');
            row.appendChild(cell);
        }
        table.appendChild(row);
    }

    var settings = document.getElementById('settings');
    settings.setAttribute('onclick', 'createEditTableMenuDialog()');
};

createEditTableMenuDialog = function(){
    modalDialog.setAttribute('id', 'editTableMenuDialog');
    modalDialog.setAttribute('style', 'width:auto;');
    cleanModalDialog('editTableMenuDialog');

    modalDialog.appendChild(createButton('btn editTableDialogButton', 'addColumn', 'Add Column', 'createTextFieldDialog("Add Column(s)", "NewCol = sqrt(' + currentData.names[Math.ceil(currentData.names.length/2)] + ')", "add")'));
    modalDialog.appendChild(document.createElement('br'));
    modalDialog.appendChild(createButton('btn editTableDialogButton', 'editColumn', 'Edit Column', 'createTextFieldDialog("Edit Column(s)", ' +
        '"' + currentData.names[Math.ceil(currentData.names.length/2)] + ' = sqrt(' + currentData.names[Math.ceil(currentData.names.length/2) + 1] + ')", "edit")'));
    modalDialog.appendChild(document.createElement('br'));
    modalDialog.appendChild(createButton('btn editTableDialogButton', 'removeColumn', 'Remove Column', 'createTextFieldDialog("Remove Column(s)", "' + currentData.names[Math.ceil(currentData.names.length/2)] +'", "remove")'));
    $('div#editTableMenuDialog').show();
    $('.backgroundDiv').height(getMaxHeight()).show();
};

createTextFieldDialog = function(title, eg, type){
    modalDialog.setAttribute('id', 'textFieldDialog');
    modalDialog.setAttribute('style', 'width: 500px;');
    cleanModalDialog('textFieldDialog');

    modalDialog.appendChild(createH4Title(title));
    modalDialog.appendChild(createBr());
    var textField = createTextField('commandTextField', 'editDataTextField', '');
    textField.setAttribute('placeholder', 'Insert Formula! eg: ' + eg);
    modalDialog.appendChild(textField);
    modalDialog.appendChild(createBr());
    okButton.setAttribute('onclick', 'editData("' + type + '")');
    modalDialog.appendChild(okButton);
    cancelButton.setAttribute('onclick', '$("div#textFieldDialog").hide(); $(".backgroundDiv").hide();');
    modalDialog.appendChild(cancelButton);

    modalDialog.appendChild(createButton('btn','buttonVariable', 'Go Back', 'createEditTableMenuDialog()'));
    showElement('div#textFieldDialog');
};

editData = function(type){
    var text = document.getElementById('editDataTextField').value;
    if(text == ""){
        popUpMessage('Empty formula textfield!');
        return;
    }
    var commands = [];
    var name = document.getElementById('subsetNameTextField').value;

    if(text == "" || name == ""){
        popUpMessage('Emplty textfield!');
        return;
    }

    while(text.length > 0){
        var index = text.indexOf(' AND ');
        if(index == -1){
            commands.push(text);
            text = text.slice(text.length);
        }else{
            commands.push(text.slice(0, index));
            text = text.slice(index + 5);
        }
    }

    var options = {
        group: currentVariablesGroupName,
        subset: currentSubsetName
    };

    if(type == 'remove'){
        for(i = 0; i < commands.length; i++){
            if(currentData.names.indexOf(commands[i]) == -1){
                popUpMessage('Column "' + commands[i] + '" does not exist!');
                return;
            }else{
                commands[i] = currentData.names.indexOf(commands[i]);
            }
            options['indexes'] = commands;
            Shiny.onInputChange("removeColumn", options);
        }
    }else{
        var names = [];
        for(var i = 0; i < commands.length; i++){

            index = 0;
            if(commands[i].indexOf(' =') != -1){
                index = commands[i].indexOf(' =');
            }else if(commands[i].indexOf('=') != -1){
                index = commands[i].indexOf('=');
            }else if(commands[i].indexOf(' <-') != -1){
                index = commands[i].indexOf(' <-');
            } else if(commands[i].indexOf('<-') != -1){
                index = commands[i].indexOf('<-');
            }else{
                popUpMessage('Formula is wrong!');
                return
            }

            names[i] = commands[i].slice(0, index);
        }
        options['names'] = names;
        options['commands'] = commands;

        if(type == "add"){
            options['message'] = 'Column(s) successfully added!';
            options['typeOfVariables'] = typeOfSelectedVariableGroup;
            options['variables'] = currentVariablesGroupName;
            Shiny.onInputChange('addOrEditColumn', options)
        }else{
            for(i = 0; i < names.length; i++){
                if(currentData.names.indexOf(names[i]) == -1){
                    popUpMessage('Column "' + names[i] + '" does not exist!')
                    return;
                }
            }
            options['message'] = 'Column(s) successfully edited!';
            Shiny.onInputChange('addOrEditColumn', options)
        }
    }

    cleanModalDialog('textFieldDialog');
    hideElement('div#textFieldDialog');
    $('.backgroundDiv').hide();
};

getNames = function(data){
    return Object.keys(data);
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

        modalDialog.appendChild(createDiv('names', names[i], names[i]));
        modalDialog.appendChild(createRadio('radio', names[i] + 'Radio', names[i], 'Radio'));
        modalDialog.appendChild(createBr());
    }

    okButton.setAttribute('onclick', okFunction);
    modalDialog.appendChild(okButton);
    cancelButton.setAttribute('onclick', '$("div#radioDialog").hide(); resetUploadFile(); $("backgroundDiv").hide();');
    modalDialog.appendChild(cancelButton);

    showElement('div#radioDialog');
    $('.backgroundDiv').height(getMaxHeight()).show();
};

getChosenPackage = function(){
    var checked = getChosenRadio();
    cleanModalDialog('radioDialog');
    hideElement('div#radioDialog');
    $('.backgroundDiv').hide();
    Shiny.onInputChange('chosenPackage', checked);
};

getChosenData = function(){
    var checked = getChosenRadio();
    cleanModalDialog('radioDialog');
    hideElement('div#radioDialog');
    $('.backgroundDiv').hide();
    Shiny.onInputChange('chosenData', checked);
};

getChosenRadio = function(){
    var radios = document.getElementsByClassName('radio');
    var checked;

    for(var i = 0; i < radios.length; i++){
        if(radios[i].checked){
            checked = radios[i].value;
            cleanModalDialog();
            hideElement();
            removeAllElementByClass('.radio');
            break;
        }
    }

    return checked;
};

resetUploadFile = function(){
    var uploadFile = document.getElementById('uploadCSVFile');
    uploadFile.value = '';
    Shiny.onInputChange('chosenData', null);
    Shiny.onInputChange('chosenPackage', null);
};

resetDataSelector = function(){
    Shiny.onInputChange('dataSelectorChosenData', null);
};

createFileOptionDialog = function(message, fromFile){
    modalDialog.setAttribute('id', 'textFieldDialog');
    cleanModalDialog('textFieldDialog');
    modalDialog.setAttribute('style', 'width:500px;');

    modalDialog.appendChild(createH4Title("Upload File - Options"));
    modalDialog.appendChild(createBr());
    modalDialog.appendChild(createDiv('csvFileDialogDiv', 'filenameDiv', 'Filename:'));

    if(message.indexOf(".") > -1){
        message = message.substring(0, message.indexOf("."))
    }

    modalDialog.appendChild(createTextField('textField', 'fileNameTextField', message));
    modalDialog.appendChild(createHr());

    if(fromFile){
        modalDialog.appendChild(createDiv('csvFileDialogDiv', 'separatorDiv', 'Separator:'));
        modalDialog.appendChild(createTextField('textField', 'separatorTextField', ','));
        modalDialog.appendChild(createBr());

        modalDialog.appendChild(createDiv('csvFileDialogDiv', 'decimalDiv', 'Decimal:'));
        modalDialog.appendChild(createTextField('textField', 'decimalTextField', '.'));

        modalDialog.appendChild(createDiv('csvFileDialogDiv', 'quotesDiv', 'Quotes:'));
        modalDialog.appendChild(createTextField('textField', 'quotesTextField', '"'));
        modalDialog.appendChild(createHr());

        modalDialog.appendChild(createDiv('csvFileDialogDiv', 'headerDiv', 'Header'));
        modalDialog.appendChild(createCheckBox('csvFileDialogCheckbox', 'headerCheckbox'));

        modalDialog.appendChild(createDiv('csvFileDialogDiv', 'fillDiv', 'Fill'));
        modalDialog.appendChild(createCheckBox('csvFileDialogCheckbox', 'fillCheckbox'));
        modalDialog.appendChild(createBr());
        modalDialog.appendChild(createBr());

        modalDialog.appendChild(createDiv('csvFileDialogDiv', 'stripeWitheDiv', 'Stripe White'));
        modalDialog.appendChild(createCheckBox('csvFileDialogCheckbox', 'stripWhiteCheckbox'));

        modalDialog.appendChild(createDiv('csvFileDialogDiv', 'stringAsFactorsDiv', 'String as factors'));
        modalDialog.appendChild(createCheckBox('csvFileDialogCheckbox', 'stringAsFactorCheckbox'));
        modalDialog.appendChild(createBr());
        modalDialog.appendChild(createHr());
    }

    okButton.setAttribute('onclick', 'uploadFile(' + fromFile +')');
    cancelButton.setAttribute('onclick', 'hideElement("div#textFieldDialog"); resetUploadFile(); $(".backgroundDiv").hide()');
    modalDialog.appendChild(okButton);
    modalDialog.appendChild(cancelButton);
    modalDialog.appendChild(createButton('btn', 'buttonVariable', 'Preview',
        'previewFile(' + fromFile + ')'));

    showElement('div#textFieldDialog');
    $('.backgroundDiv').height(getMaxHeight()).show();
};

uploadFile = function(fromFile){
    var options = getUploadOptions(fromFile);
    Shiny.onInputChange('uploadChosenFile', options);
    cleanModalDialog('textFieldDialog');
    hideElement('div#textFieldDialog');
    $('.backgroundDiv').hide();
};

previewFile = function(fromFile){
    var options = getUploadOptions(fromFile);
    Shiny.onInputChange('preview', options);
};

getUploadOptions = function(fromFile){
    var options;

    var name = document.getElementById('fileNameTextField').value;
    var separator, decimal, quotes;

    if(name == ''){
        popUpMessage('ERROR: empty name-textField!');
        resetUploadFile();
        return;
    }
    if(fromFile){
        separator = document.getElementById('separatorTextField').value;
        decimal = document.getElementById('decimalTextField').value;
        quotes = document.getElementById('quotesTextField').value;

        if(separator == '' || decimal == '' || quotes == ''){
            popUpMessage('ERROR: empty textField!');
            resetUploadFile();
            return;
        }
    }

    if(fromFile){
        options = {
            name: name,
            separator: separator,
            decimal: decimal,
            quotes: quotes,
            header: document.getElementById('headerCheckbox').checked,
            fill: document.getElementById('fillCheckbox').checked,
            stripWhite: document.getElementById('stripWhiteCheckbox').checked,
            stringAsFactor: document.getElementById('stringAsFactorCheckbox').checked
        };
    }
    else{
        options = {
            name: document.getElementById('fileNameTextField').value
        };
    }

    return options;
};

createPreviewTable = function(data){

    showElement('img#xButton');
    cleanTable('previewTable');
    createTable('previewTable', getNames(data), data);
    showElement('div#previewTable');
    $('.backgroundDiv').height(getMaxHeight()).show();

    Shiny.onInputChange('preview', null);
};


/**********************************************************************************
 **********************************************************************************
 ************************* DATA MANIPULATION *************************************+
 **********************************************************************************
 ************************** DATA MISSING VALUES - IMPUTATION **********************
 *********************************************************************************/
createMissingValuesDialog = function(){
    cleanModalDialog('missingValuesWell');
    hideElement('div#nasWell');
    if(typeOfSelectedVariableGroup != "transformations"){
        missingValuesMethodsContainer.appendChild(createHr());
        var methodSelector = createSelect('', 'missingValuesMethodSelector');
        methodSelector.setAttribute('onclick', 'createMissingValuesParameters(selectedOptions)');
        missingValuesMethodsContainer.appendChild(createDiv('dataManipulation','dataManipulation', 'Method'));
        missingValuesMethodsContainer.appendChild(methodSelector);
        missingValuesMethodsContainer.appendChild(createDiv('parameterContainer', 'parameterContainer', ''));


        showElement('div#nasWell');
        if(typeOfSelectedVariableGroup == 'compositions'){
            for(obj in missingValuesComposition){
                methodSelector.appendChild(createOption('missingValuesDialog composition', obj, obj));
            }
        }
        else{
            for(obj in missingValuesNonComposition){
                methodSelector.appendChild(createOption('missingValuesDialog nonComposition', obj, obj));
            }
        }


        missingValuesMethodsContainer.appendChild(createHr());
        missingValuesMethodsContainer.appendChild(createDiv('','missingValuesCheckBoxDiv',''));
        missingValuesMethodsContainer.appendChild(createHr());
        missingValuesMethodsContainer.appendChild(missingValuesOkButton);
        createMissingValuesCheckBoxDiv();
        createMissingValuesParameters(methodSelector.selectedOptions);
    } else{
        missingValuesMethodsContainer.appendChild(createH4Title('Imputation methods cannot be applied on chosen data!'));
    }
};

createMissingValuesCheckBoxDiv = function(){
    cleanModalDialog('missingValuesCheckBoxDiv');
    var div = document.getElementById('missingValuesCheckBoxDiv');

    var text = createDiv('', '', 'Overwrite current data');
    text.setAttribute('style', 'float:left; padding-right:10px');
    div.appendChild(text);
    var cb = createCheckBox('','','');
    cb.checked = true;
    cb.setAttribute('onclick', 'addRemoveTextFieldToMissingValuesCheckBoxDiv(checked)');
    div.appendChild(cb);
    div.appendChild(createBr());
};

addRemoveTextFieldToMissingValuesCheckBoxDiv = function(checked){
    var div = document.getElementById('missingValuesCheckBoxDiv');
    if(!checked){
        div.appendChild(createTextField('','missingValuesCheckBoxDivTextField', document.getElementById('dataSelector').value + 'Imp'));
    }
    else{
        div.removeChild(document.getElementById('missingValuesCheckBoxDivTextField'));
    }
};

createMissingValuesParameters = function(selectedOptions){
    cleanModalDialog('parameterContainer');
    var option = selectedOptions[0];
    var parameters;

    if((option.className).indexOf('non') == -1){
        parameters = missingValuesComposition[option.value];
    }
    else{
        parameters = missingValuesNonComposition[option.value];
    }

    var container = document.getElementById('parameterContainer');
    for(var par in parameters){
        var parameter = parameters[par];
        container.appendChild(createDiv('', '', parameter[0]));
        if(parameter.length == 2){
            container.appendChild(createTextField('','' + par, parameter[1]));
        }
        else{
            var sel = createSelect('', '' + par);
            for(var i = 1; i < parameter.length; i++){
                sel.appendChild(createOption('', parameter[i], parameter[i]));
            }
            container.appendChild(sel);
        }
    }
};

createNAsInfo = function(names, nas){
    cleanModalDialog('nasWell');

    nasInfoWell.appendChild(createH4Title('Missing Values'));
    nasInfoWell.appendChild(createBr());

    for(var i = 0; i < nas.length; i++){
        var div = createDiv('nasInfo', 'nasInfo', '');
        div.appendChild(createDiv('nasInfoRow', '', names[i]));
        div.appendChild(createDiv('', '', nas[i]));

        nasInfoWell.appendChild(div);
    }
};

getChosenImputationMethod = function(){
    var options = {};
    var tmp = document.getElementById('missingValuesCheckBoxDiv').children;
    if(tmp.length == 3){
        options['name'] = 0;
    }
    else{
        options['name'] = tmp[3].value;
    }

    options["group"] = currentVariablesGroupName;

    var method = document.getElementById('missingValuesMethodSelector').value;

    var pars = document.getElementById('parameterContainer').children;
    for(var i = 0; i < pars.length; i++){
        if(pars[i].tagName == 'INPUT' || pars[i].tagName == 'SELECT'){
            if(pars[i].tagName == 'INPUT' && pars[i].value == ""){
                popUpMessage("ERROR: input field is empty!");
                return;
            }else{
                options[pars[i].id] = pars[i].value;
            }
        }
    }

    options["variablesGroup"] = currentVariablesGroup;

    options["subset"] = currentSubsetName;

    if(method == 'impCoda'){
        Shiny.onInputChange('impCodaImp', options);
    }
    else if(method == 'impKNNa'){
        Shiny.onInputChange('impKNNaImp', null);
    }else if(method == 'kNN'){
        Shiny.onInputChange('kNNImp', options);
    }else{
        Shiny.onInputChange('irmiImp', options);
    }
};


/**********************************************************************************
 ************************************ DETECTION LIMIT *****************************
 *********************************************************************************/
createDetectionLimitDialog = function(){
    cleanModalDialog('detectionLimitWell');
    hideElement('div#infoWell');
    if(typeOfSelectedVariableGroup != 'transformations'){
        if(currentData.ldl == null){
            detectionLimitMethodContainer.appendChild(createH4Title('Chosen data does not contain detection limits! <br> Please define them in your .csv-file!'));
        }
        else{
            detectionLimitMethodContainer.appendChild(createHr());
            detectionLimitMethodContainer.appendChild(createDiv('dataManipulation','dataManipulation', 'Method'));
            var methodSelector = createSelect('', 'detectionLimitMethodSelector');
            methodSelector.setAttribute('onclick','createDetectionLimitParameters(selectedOptions)');
            detectionLimitMethodContainer.appendChild(methodSelector);
            detectionLimitMethodContainer.appendChild(createDiv('','detectionLimitParameters', ''));
            if(typeOfSelectedVariableGroup == "compositions"){
                for(var obj in detectionLimitCompositions){
                    methodSelector.appendChild(createOption('detectionLimitDialog composition', obj, obj));
                }
            }
            else{
                for(obj in detectionLimitNonCompositions){
                    methodSelector.appendChild(createOption('detectionLimitDialog nonComposition', obj, obj));
                }
            }
            detectionLimitMethodContainer.appendChild(createHr());
            detectionLimitMethodContainer.appendChild(createDiv('', 'detectionLimitCheckBoxDiv', ''));
            detectionLimitMethodContainer.appendChild(createHr());
            detectionLimitMethodContainer.appendChild(createButton('btn', 'buttonVariable', 'OK', 'getChosenDLMethod()'));
            createDetectionLimitParameters(methodSelector.selectedOptions);
            createDetectionLimitCheckBoxDiv();
        }
    }else{
        detectionLimitMethodContainer.appendChild(createH4Title('Imputation methods cannot be applied on chosen data!'));
    }
};

createDetectionLimitParameters = function(selectedOption){
    cleanModalDialog('detectionLimitParameters');
    var option = selectedOption[0];
    var parameters;
    if((option.className).indexOf('non') == -1){
        parameters = detectionLimitCompositions[option.value];
    }
    else{
        parameters = detectionLimitNonCompositions[option.value];
    }

    var container = document.getElementById('detectionLimitParameters');
    for(var par in parameters){
        var parameter = parameters[par];
        container.appendChild(createDiv('', '', parameter[0]));
        if(parameter.length == 2){
            container.appendChild(createTextField('','' + par, parameter[1]));
        }
        else{
            var sel = createSelect('', '' + par);
            for(var i = 1; i < parameter.length; i++){
                sel.appendChild(createOption('', parameter[i], parameter[i]));
            }
            container.appendChild(sel);
        }
    }
};

createDetectionLimitCheckBoxDiv = function(){
    cleanModalDialog('detectionLimitCheckBoxDiv');
    var div = document.getElementById('detectionLimitCheckBoxDiv');

    var text = createDiv('', '', 'Overwrite current data');
    text.setAttribute('style', 'float:left; padding-right:10px');
    div.appendChild(text);
    var cb = createCheckBox('','','');
    cb.checked = true;
    cb.setAttribute('onclick', 'addRemoveTextFieldToDetectionLimitCheckBoxDiv(checked)');
    div.appendChild(cb);
    div.appendChild(createBr());
};

addRemoveTextFieldToDetectionLimitCheckBoxDiv = function(checked){
    var div = document.getElementById('detectionLimitCheckBoxDiv');
    if(!checked){
        div.appendChild(createTextField('','detectionLimitCheckBoxDivTextField', document.getElementById('dataSelector').value + 'Imp'));
    }
    else{
        div.removeChild(document.getElementById('detectionLimitCheckBoxDivTextField'));
    }
};

createDetectionLimitInfoWell = function(names, udl, ldl){
    cleanModalDialog('infoWell');

//    if(udl != null){
//        detectionLimitInfoWell.appendChild(createH4Title("UDL"));
//        detectionLimitInfoWell.appendChild(createBr());
//        for(var i = 0; i < udl.length; i++){
//            if(udl[i] != ""){
//                var div = createDiv('dLInfo', 'dLInfo', '');
//                div.appendChild(createDiv('dLInfoRow', '', names[i]));
//                div.appendChild(createDiv('', '', udl[i]));
//                detectionLimitInfoWell.appendChild(div);
//            }
//        }
//    }

    if(ldl != null){
        detectionLimitInfoWell.appendChild(createH4Title("LDL"));
        detectionLimitInfoWell.appendChild(createBr());
        for(var i = 0; i < ldl.length; i++){
            if(ldl[i] != ""){
                div = createDiv('dLInfo', 'dLInfo', '');
                div.appendChild(createDiv('dLInfoRow', '', names[i]));
                div.appendChild(createDiv('', '', ldl[i]));
                detectionLimitInfoWell.appendChild(div);
            }
        }
    }

    showElement('div#infoWell');
};

getChosenDLMethod = function(){
    var options = {};
    var tmp = document.getElementById('detectionLimitCheckBoxDiv').children;
    options["name"] = 0;
    if(tmp.length == 4){
        options["name"] = tmp[3].value;
    }
    options["group"] = currentVariablesGroupName;

    var method = document.getElementById('detectionLimitMethodSelector').value;
    var pars = document.getElementById('detectionLimitParameters').children;

    for(var i = 0; i < pars.length; i++){
        if(pars[i].tagName == 'SELECT'){
            options[pars[i].id] = pars[i].value;
        }
    }

    options["variablesGroup"] = currentVariablesGroup;
    options["subset"] = currentSubsetName;

    if(method == 'impRZilr'){
        Shiny.onInputChange('inpRZilr', options);
    }
    else{
        Shiny.onInputChange("DLMultiplyByFactor", null);
    }
};


/**********************************************************************************
 ************************************ TRANSFORMATIONS *****************************
 *********************************************************************************/

createTransformationsDialog = function(){
    cleanModalDialog('transformationsWell');
    hideElement('div#transformationVariablesDiv');
    var transformationsContainer = document.getElementById('transformationsWell');
    if(typeOfSelectedVariableGroup == 'compositions'){
        transformationsContainer.appendChild(createHr());
        transformationsContainer.appendChild(createDiv('dataManipulation','dataManipulation', 'Method'));
        var methodSelector = createSelect('', 'transformationsMethodSelector');
        methodSelector.setAttribute('onclick', 'createTransformationsParameters(selectedOptions)');
        transformationsContainer.appendChild(methodSelector);
        transformationsContainer.appendChild(createDiv('', 'transformationsParameters', ''));
        for(var obj in transformationsCompositions){
            methodSelector.appendChild(createOption('transformationMethod', obj, obj));
        }
        transformationsContainer.appendChild(createHr());
        transformationsContainer.appendChild(createTextField('','transformationsTextField', document.getElementById('dataSelector').value + "_" +
            document.getElementById('transformationsMethodSelector').value));
        transformationsContainer.appendChild(createHr());
        transformationsContainer.appendChild(createButton('btn', 'buttonVariable', 'OK', 'getTransformationMethod()'));
        createTransformationsParameters(methodSelector.selectedOptions);
        createTransformationsVariablesDiv();
    }
    else if(typeOfSelectedVariableGroup == 'transformations'){
        transformationsContainer.appendChild(createH4Title('Chosen data were transformed!'));
    }else{
        transformationsContainer.appendChild(createH4Title('Transformation methods can\'t be applied on chosen (non compositional) data!'));
    }
};

createTransformationsParameters = function(selectedOption){
    cleanModalDialog('transformationsParameters');
    var option = selectedOption[0];
    var parameters = transformationsCompositions[option.value];

    var container = document.getElementById('transformationsParameters');
    for(var par in parameters){
        var parameter = parameters[par];
        container.appendChild(createDiv('', '', parameter[0]));
        if(option.value == 'addLR'){
            container.appendChild(createTextField('','' + par, currentData.names[currentVariablesGroup[currentVariablesGroup.length - 1]]));
        }else{
            var textField = createTextField('', par, '');
            textField.setAttribute('placeholder', 'Insert Command! eg: log, sqrt...');
            textField.setAttribute('onchange', 'updateTextFieldValue(this.value)');
            container.appendChild(textField);
        }
    }
    updateTextFieldValue(document.getElementById('transformationsMethodSelector').value);
};

updateTextFieldValue = function(suffix){
    document.getElementById('transformationsTextField').value = document.getElementById('dataSelector').value + "_" +
        suffix;
};

createTransformationsVariablesDiv = function(){
    cleanModalDialog('transformationVariablesDiv');
    var container = document.getElementById('transformationVariablesDiv');
    container.appendChild(createH4Title("Variables to be used"));
    var tmpNames = getDataFromGivenIndexes(currentData.names, currentVariablesGroup);

    for(var i = 0; i < tmpNames.length; i++){
        container.appendChild(createDiv('names', '', tmpNames[i]));
        var cb = createCheckBox('transformationVariablesCheckBox', tmpNames[i], currentVariablesGroup[i]);
        cb.checked = true;
        container.appendChild(cb);
        container.appendChild(createBr());
    }
    showElement('div#transformationVariablesDiv');
};

getTransformationMethod = function(){
    var options = {};
    var tmp = document.getElementById('transformationsTextField');
    if(tmp.value != "" || tmp.value != " "){
        options["name"] = tmp.value;
    }else{
        popUpMessage("Empty textfield!");
        return;
    }

    var method = document.getElementById('transformationsMethodSelector').value;
    var pars = document.getElementById('transformationsParameters').children;
    var variablesToBeUsed = document.getElementsByClassName('transformationVariablesCheckBox');
    var variablesToBeUsedIndex = [];

    for(var i = 0; i < variablesToBeUsed.length; i++){
        if(variablesToBeUsed[i].checked){
            variablesToBeUsedIndex[i] = variablesToBeUsed[i].value;
        }
    }

    for(i = 0; i < pars.length; i++){
        if(pars[i].tagName == 'INPUT'){
            var tempNames = getDataFromGivenIndexes(currentData.names, variablesToBeUsedIndex);
            if(pars[i].value == ""){
                popUpMessage("ERROR: input field is empty!");
                return;
            }
            else if(tempNames.indexOf(pars[i].value) == -1 && pars[i].id != "command"){
                popUpMessage("ERROR: entered variable name is invalid!");
                return;
            }
            else{
                if(pars[i].id != "command"){
                    options[pars[i].id] = tempNames.indexOf(pars[i].value) + 1;
                    options["ivarName"] = pars[i].value;
                }else{
                    options[pars[i].id] = pars[i].value;
                }
            }
        }
    }

    options["variablesGroup"] = variablesToBeUsedIndex;
    options["subset"] = currentSubsetName;

    if(method == 'addLR'){
        Shiny.onInputChange("addLR", options);
    }
    else if (method == 'cenLR'){
        Shiny.onInputChange("cenLR", options);
    }
    else if(method == 'command'){
        Shiny.onInputChange('transformationCommand', options);
    }
    else{
        Shiny.onInputChange('isomLR', options);
    }

};


/**********************************************************************************
 ******************************* DEFINE VARIABLES GROUP ''*************************
 *********************************************************************************/
var checkBoxesDivNr;
createDefineVariablesGroupDialog = function(names){
    cleanModalDialog('defineVariablesGroupWell');
    checkBoxesDivNr = 1;
    var defineVariablesGroupDialog = document.getElementById('defineVariablesGroupWell');
    defineVariablesGroupDialog.appendChild(createHr());
    defineVariablesGroupDialog.appendChild(createDiv('','variablesDivContainer',''));
    defineVariablesGroupDialog.appendChild(createHr());
    defineVariablesGroupDialog.appendChild(createBr());
    if(typeOfSelectedVariableGroup != "allGroups"){
        defineVariablesGroupDialog.appendChild(createButton('btn', 'buttonVariable', 'OK', 'getNewDefinedVariablesGroups(typeOfSelectedVariableGroup)'));
        createCheckBoxesForDefineVariablesGroup(names, currentVariablesGroupName);

    }else{
        var selectorDiv = createDiv('','defineVariablesGroupSelectorDiv', '');
        defineVariablesGroupDialog.insertBefore(selectorDiv, document.getElementById('variablesDivContainer'));
        defineVariablesGroupDialog.insertBefore(createHr(), document.getElementById('variablesDivContainer'));
        var selector = createSelect('', 'typeSelect');
        selectorDiv.appendChild(createDiv('','','Choose Type'));
        selectorDiv.appendChild(selector);
        selector.appendChild(createOption('', 'compositions', 'comp'));
        selector.appendChild(createOption('', 'externals', 'extern'));
        selector.appendChild(createOption('', 'coords', 'coord'));
        selector.appendChild(createOption('', 'ids', 'id'));
        selector.setAttribute('onchange', 'changeSavedTypeInButtonFunction(this.selectedOptions[0].value); ' +
            'createCheckBoxesForDefineVariablesGroup(currentData.names, this.selectedOptions[0].value)');
        createCheckBoxesForDefineVariablesGroup(currentData.names, selector.selectedOptions[0].value);
        defineVariablesGroupDialog.appendChild(createButton('btn okButtonVariable', 'buttonVariable', 'OK',
            'getNewDefinedVariablesGroups("' + selector.selectedOptions[0].value + '")'));
    }
};

changeSavedTypeInButtonFunction = function(newType){
    document.getElementsByClassName('okButtonVariable')[0].setAttribute('onclick', 'getNewDefinedVariablesGroups("' + newType + '")');
};

createCheckBoxesForDefineVariablesGroup = function(names, checkBoxNames){
    cleanModalDialog('variablesDivContainer');
    var divsContainer = document.getElementById('variablesDivContainer');
    var namesDiv = createDiv('defineVariablesVariablesDiv', 'namesDiv', '');
    namesDiv.appendChild(createDiv('variablesType', 'variablesNames', 'Variables'));

    var checkBoxDiv = createDiv('defineVariablesVariablesDiv', 'defineVariablesCheckBoxDiv', '');
    checkBoxDiv.appendChild(createDiv('variablesType', checkBoxNames + '_1', checkBoxNames + '_1'));

    for(var i = 0; i < names.length; i++){
        var nameCont = createDiv('variableChooserNameContainer', '', '');
        nameCont.appendChild(createDiv('names', '',  names[i]));
        namesDiv.appendChild(nameCont);
        namesDiv.appendChild(createBr());

        var checkBoxCont = createDiv('variableChooserCheckBoxContainer', '', '');
        checkBoxCont.appendChild(createCheckBox('variableGroupCheckbox ' + checkBoxNames +'_1Check',
            checkBoxNames +'_1Check', names[i]));
        checkBoxDiv.appendChild(checkBoxCont);
        checkBoxDiv.appendChild(createBr());
    }
    checkBoxDiv.appendChild(createImage('checkAll', checkBoxNames + '_1CheckAll',
        'checkAll.png', 'selectAllCheckBoxes("'+ checkBoxNames + '_1Check")'));
    checkBoxDiv.appendChild(createBr());
    checkBoxDiv.appendChild(createBr());
    checkBoxDiv.appendChild(createTextField('variablesGroupTextField ' + checkBoxNames + '_1TextField',
        checkBoxNames + '_1TextField', checkBoxNames + '_1'));

    divsContainer.appendChild(namesDiv);
    divsContainer.appendChild(checkBoxDiv);
    divsContainer.appendChild(createAddButton('addCheckBoxDivButton', 'addCheckBoxDivToDefineVariablesGroupDialog("' + checkBoxNames + '");'));
    $('#variablesDivContainer').height(($('.variableGroupCheckbox').length * 40) + 120);
};

addCheckBoxDivToDefineVariablesGroupDialog = function(checkBoxNames){
    checkBoxesDivNr++;
    var elem = document.getElementById('addCheckBoxDivButton');
    var container = document.getElementById('variablesDivContainer');
    var variablesDiv = createDiv('defineVariablesVariablesDiv', '', '');
    variablesDiv.appendChild(createDiv('variablesType', checkBoxNames + '_' + checkBoxesDivNr,
        checkBoxNames + '_' + checkBoxesDivNr));

    var checks = document.getElementsByClassName(checkBoxNames + '_' + (checkBoxesDivNr-1) +'Check');
    for(var i = 0; i < checks.length; i++){
        var checkCont = createDiv('variableChooserNameContainer', '', '');
        checkCont.appendChild(createCheckBox('variableGroupCheckbox '+ checkBoxNames + '_' + checkBoxesDivNr + 'Check',
            checkBoxNames + '_' + checkBoxesDivNr + 'Check', checks[i].value));
        variablesDiv.appendChild(checkCont);
        variablesDiv.appendChild(createBr());
    }
    variablesDiv.appendChild(createImage('checkAll', checkBoxNames + '_' + checkBoxesDivNr + 'CheckAll', 'checkAll.png',
        'selectAllCheckBoxes(' + checkBoxNames + '_' + checkBoxesDivNr + "Check"+')'));
    variablesDiv.appendChild(createBr());
    variablesDiv.appendChild(createBr());
    variablesDiv.appendChild(createTextField('variablesGroupTextField ' + checkBoxNames + '_' + checkBoxesDivNr + 'TextField',
        checkBoxNames + '_' + checkBoxesDivNr + 'TextField', checkBoxNames + '_' + checkBoxesDivNr));
    container.insertBefore(variablesDiv, elem);

    var variablesDivCount = $('.defineVariablesVariablesDiv').length;
    $('#variablesDivContainer').width((variablesDivCount * 70) + 30);
};

getNewDefinedVariablesGroups = function(typeOfVariablesGroup){

    var groups = {};
    var type;
    var checkBoxes = document.getElementsByClassName('variableGroupCheckbox');
    var textFields = document.getElementsByClassName("variablesGroupTextField");
    var observations = checkBoxes.length/textFields.length;

    for(var i = 0; i < textFields.length; i++){
        if(textFields[i].value == "" || textFields[i].value == " "){
            popUpMessage("Empty textfield!");
            return;
        }
    }

    if(!((typeOfVariablesGroup).indexOf('id') === -1)){
        type = 'id';
    }
    else if(!((typeOfVariablesGroup).indexOf('comp') === -1)){
        type = 'comp';
    }
    else if(!((typeOfVariablesGroup).indexOf('extern') === -1)){
        type = 'extern';
    }
    else if(!((typeOfVariablesGroup).indexOf('coord') === -1)){
        type = 'coord';
    }
    else{
        type = 'transformations';
        var names = getNames(currentVariablesGroup);
    }

    for(var column = 0; column < textFields.length; column++){
        var checked;
        if(typeOfVariablesGroup != 'transformations'){
            checked = [];
        }else{
            checked = {};
        }

        if(typeOfSelectedVariableGroup == 'allGroups'){
            for(i = 0; i < currentData.names.length; i++){
                currentVariablesGroup.push(i);
            }
        }

        var checkBoxIndex = column * observations;

        for(var observationIndex = checkBoxIndex; observationIndex < checkBoxIndex + observations; observationIndex++){
            if(checkBoxes[observationIndex].checked){
                if(typeOfVariablesGroup != 'transformations'){
                    checked.push(currentVariablesGroup[observationIndex % observations]);
                }
                else{
                    checked[names[observationIndex % observations]] = currentVariablesGroup[names[observationIndex % observations]];
                }
            }

        }
        groups[textFields[column].value] = checked;
        (currentData[typeOfVariablesGroup])[textFields[column].value] = checked;
    }
    if(typeOfSelectedVariableGroup == 'allGroups'){
        currentVariablesGroup = [];
    }

    createVariableGroupSelector();
    setVariablesGroupSelectorValue(currentVariablesGroupName);
    groups["type"] = type;
    Shiny.onInputChange('newDefinedVariablesGroups', groups);
};


/**********************************************************************************
 ********************************* DEFINE OBSERVATIONS GROUP **********************
 *********************************************************************************/
createDefineObservationsGroupDialog = function(){
    if(currentData.data != null && currentData.data != undefined){
        cleanModalDialog('defineObservationsGroupWell');
        var defineObservationsGroupDialog = document.getElementById('defineObservationsGroupWell');
        defineObservationsGroupDialog.appendChild(createHr());
        defineObservationsGroupDialog.appendChild(createDiv('','', 'Method'));
        var methodSelector = createSelect('', 'defineObservationsGroupMethodSelector');
        methodSelector.setAttribute('onclick','createDefineObservationsGroupMethodWell(selectedOptions)');
        methodSelector.appendChild(createOption('defineObservationsGroupMethodOption', 'Command', 'Command'));
        methodSelector.appendChild(createOption('defineObservationsGroupMethodOption', 'Factor', 'Factor'));
        defineObservationsGroupDialog.appendChild(methodSelector);
        defineObservationsGroupDialog.appendChild(createHr());
        defineObservationsGroupDialog.appendChild(createDiv('', 'defineObservationsGroupMethodContainer', ''));
        defineObservationsGroupDialog.appendChild(createBr());
        defineObservationsGroupDialog.appendChild(createHr());
        createDefineObservationsGroupMethodWell(methodSelector.selectedOptions);
        defineObservationsGroupDialog.appendChild(createButton('btn', 'buttonVariable', 'OK', 'getChosenObservations();'));
    }
};

createDefineObservationsGroupMethodWell = function(selectedOptions){
    cleanModalDialog('defineObservationsGroupMethodContainer');
    if(selectedOptions[0].value == 'Command'){
        createCommandTextField();
    }
    else{
        createFactorDialog();
    }
};

createCommandTextField = function(){
    var container = document.getElementById('defineObservationsGroupMethodContainer');
    container.appendChild(createDiv('','', 'Command'));
    var textFiled = createTextField('commandTextField', 'defineObservationsCommandTextField', '');
    textFiled.setAttribute('placeholder', 'Enter Command! eg: ' + currentData.names[Math.ceil(currentData.names.length/2)] +' > 50');
    container.appendChild(textFiled);
    container.appendChild(createDiv('','', 'Name'));
    container.appendChild(createTextField('', 'subsetNameTextField', document.getElementById('dataSelector').value + "_obs"));
};

createFactorDialog = function(){
    var container = document.getElementById('defineObservationsGroupMethodContainer');
    var factorSelector = createSelect('', 'factorSelector');
    factorSelector.setAttribute('onclick', 'createDefinitionByFactorContainer(selectedOptions)');
    for(var i = 0; i < currentData.variablesTypes.length; i++){
        if(currentData.variablesTypes[i] == 'factor'){
            factorSelector.appendChild(createOption('', currentData.names[i], currentData.names[i]));
        }
    }

    container.appendChild(factorSelector);
    container.appendChild(createBr());
    container.appendChild(createDiv('', 'definitionByFactorContainer', ''));
    createDefinitionByFactorContainer(factorSelector.selectedOptions);
};

var nrObs;
createDefinitionByFactorContainer = function(selectedOptions){
    cleanModalDialog('definitionByFactorContainer');
    nrObs = 1;
    var option = selectedOptions[0];
    var container = document.getElementById('definitionByFactorContainer');
    var factorLabels = [];
    var factorColumn = currentData.data[option.value];
    for(var i = 0; i < factorColumn.length; i++){
        if(factorLabels.indexOf(factorColumn[i]) == -1){
            factorLabels.push(factorColumn[i]);
        }
    }

    var namesDiv = createDiv('defineObservationsVariablesDiv', 'namesDiv', '');
    namesDiv.appendChild(createDiv('variablesType', 'variablesNames', 'Variables'));

    var checkBoxDiv = createDiv('defineObservationsVariablesDiv', 'definitionByFactorVariablesDiv', '');
    checkBoxDiv.appendChild(createDiv('variablesType', currentVariablesGroupName + "_obs1", currentVariablesGroupName + "_obs1"));

    for(i = 0; i < factorLabels.length; i++){
        var nameCont = createDiv('variableChooserNameContainer', '', '');
        nameCont.appendChild(createDiv('names', '',  factorLabels[i]));
        namesDiv.appendChild(nameCont);
        namesDiv.appendChild(createBr());

        var checkBoxCont = createDiv('variableChooserCheckBoxContainer', '', '');
        checkBoxCont.appendChild(createCheckBox('observationGroupCheckbox ' + currentVariablesGroupName +'_obs1Check',
            currentVariablesGroupName +'_obs1Check', factorLabels[i]));
        checkBoxDiv.appendChild(checkBoxCont);
        checkBoxDiv.appendChild(createBr());
    }

    checkBoxDiv.appendChild(createImage('checkAll', currentVariablesGroupName + '_obs1CheckAll',
        'checkAll.png', 'selectAllCheckBoxes("'+ currentVariablesGroupName + '_obs1Check")'));
    checkBoxDiv.appendChild(createBr());
    checkBoxDiv.appendChild(createBr());
    checkBoxDiv.appendChild(createTextField('observationsGroupTextField ' + currentVariablesGroupName + '_obs1TextField',
        currentVariablesGroupName + '_obs1TextField', document.getElementById('dataSelector').value + '_obs1'));


    container.appendChild(namesDiv);
    container.appendChild(checkBoxDiv);
    container.appendChild(createAddButton('addCheckBoxDivButtonToDefinitionByFactorContainerButton', 'addCheckBoxDivButtonToDefinitionByFactorContainer();'));

    $('#definitionByFactorContainer').height($('#definitionByFactorVariablesDiv').height());
};

addCheckBoxDivButtonToDefinitionByFactorContainer = function(){
    nrObs++;
    var elem = document.getElementById('addCheckBoxDivButtonToDefinitionByFactorContainerButton');
    var container = document.getElementById('definitionByFactorContainer');
    var variablesDiv = createDiv('defineObservationsVariablesDiv', '', '');
    variablesDiv.appendChild(createDiv('variablesType', currentVariablesGroupName + "_obs" + nrObs, currentVariablesGroupName + "_obs" + nrObs));

    var checks = document.getElementsByClassName( currentVariablesGroupName +'_obs1Check');
    for(var i = 0; i < checks.length; i++){
        var checkCont = createDiv('variablesChooserNameContainer', '', '');
        checkCont.appendChild(createCheckBox('observationGroupCheckbox '+ currentVariablesGroupName + '_obs' + nrObs + 'Check',
            currentVariablesGroupName + '_obs' + nrObs + 'Check', checks[i].value));
        variablesDiv.appendChild(checkCont);
        variablesDiv.appendChild(createBr());
    }

    variablesDiv.appendChild(createImage('checkAll', currentVariablesGroupName + '_' + checkBoxesDivNr + 'CheckAll', 'checkAll.png',
        'selectAllCheckBoxes(' + currentVariablesGroupName + '_obs' + nrObs + 'Check' +')'));
    variablesDiv.appendChild(createBr());
    variablesDiv.appendChild(createBr());
    variablesDiv.appendChild(createTextField('observationsGroupTextField ' + currentVariablesGroupName + '_obs' + nrObs + 'TextField',
        currentVariablesGroupName + '_obs' + nrObs + 'TextField', document.getElementById('dataSelector').value + '_obs' + nrObs));
    container.insertBefore(variablesDiv, elem);

    var variablesDivCount = $('.defineObservationsVariablesDiv').length;
    $('#definitionByFactorContainer').width((variablesDivCount * 70) + 30);
};

getChosenObservations = function(){
    if(document.getElementById('defineObservationsGroupMethodSelector').value == 'Command'){
        var text = document.getElementById('defineObservationsCommandTextField').value;
        var commands = [];
        var name = document.getElementById('subsetNameTextField').value;

        if(text == "" || name == ""){
            popUpMessage('Emplty textfield!');
            return;
        }

        while(text.length > 0){
            var index = text.indexOf(' AND ');
            if(index == -1){
                commands.push(text);
                text = text.slice(text.length);
            }else{
                commands.push(text.slice(0, index));
                text = text.slice(index + 5);
            }
        }

        var options = {
            commands: commands,
            name: name
        };
        options['group'] = currentVariablesGroupName;

        Shiny.onInputChange('defineObservationsCommand', options)
    }else{
        var checkBoxes = document.getElementsByClassName('observationGroupCheckbox');
        var textFields = document.getElementsByClassName('observationsGroupTextField');
        var observations = checkBoxes.length/textFields.length;
        var observationsGroups = {};
        if(textFields.length == 0){
            popUpMessage('ERROR: chosen data doesn\'t have any factors!');
            return;
        }
        for(var i = 0; i < textFields.length; i++){
            if(textFields[i].value == ""){
                popUpMessage('Empty textfield!');
                return;
            }
        }

        if(currentData.subsets.length == 0){
            currentData.subsets = {};
        }

        for(i = 0; i < textFields.length; i++){
            var checkBoxIndex = i * observations;
            var indexes = [];
            for(var j = checkBoxIndex; j < checkBoxIndex + observations; j++){
                if(checkBoxes[j].checked){
                    indexes = indexes.concat(getAllIndexes(currentData.data[document.getElementById('factorSelector').value], checkBoxes[j].value));
                }
            }
            observationsGroups[textFields[i].value] = indexes;
            currentData.subsets[textFields[i].value] = indexes;
        }

        createSubsetSelector();
        setSelectorsValue(currentSubsetName);
        Shiny.onInputChange('defineObservationsFactor', observationsGroups);
    }
};

/**********************************************************************************
 **********************************************************************************
 ************************* STATISTICAL METHODS ***********************************+
 **********************************************************************************
 ************************************ PCA *****************************************
 *********************************************************************************/
createPCADialog = function(){
    cleanModalDialog('pcaWell');
    var pcaContainer = document.getElementById('pcaWell');
    if(typeOfSelectedVariableGroup == 'transformations'){
        pcaContainer.appendChild(createH4Title('PCA can\'t be applied on transformed data!'));
    } else if (typeOfSelectedVariableGroup == 'compositions' || typeOfSelectedVariableGroup == 'externals') {

        if (typeOfSelectedVariableGroup == 'externals') {
            h2 = document.createElement("h4");
            h2.textContent = "PCA - prcomp";
            pcaContainer.appendChild(h2);
        } else {
            h2 = document.createElement("h4");
            h2.textContent = "PCA - pcaCoDa";
            pcaContainer.appendChild(h2);
        }

        pcaContainer.appendChild(createHr());
        pcaContainer.appendChild(createDiv('', '', 'Method'));
        var selector = createSelect('', 'pcaMethodSelect');
        pcaContainer.appendChild(selector);
        selector.appendChild(createOption('', 'robust', 'robust'));
        selector.appendChild(createOption('', 'standard', 'standard'));		
		pcaContainer.appendChild(createBr());
		if (typeOfSelectedVariableGroup == 'externals') {
		    pcaContainer.appendChild(createBr());
		    pcaContainer.appendChild(createDiv('', '', 'log'));
		    var cb = createCheckBox('pcaLogCheckBox', 'pcaLogCheckBox', 'log');
		    cb.checked = false;
		    pcaContainer.appendChild(cb);
			pcaContainer.appendChild(createBr());
			pcaContainer.appendChild(createDiv('', '', 'Scale'));
			pcaContainer.appendChild(createCheckBox('plotDialogElement', 'pcaScaleCheckBox', 'Scale'));
		}

		pcaContainer.appendChild(createHr());
		var xAxis = createDiv('variablesType', 'xAxisDiv', 'x - axis');
		xAxis.setAttribute('title', 'which principal component should be represented on the x axis');
		var xTextField = createTextField('plotDialogElement', 'pcaXTextField', '1');
		pcaContainer.appendChild(xAxis);
		xTextField.setAttribute('title', 'which principal component should be represented on the x axis');
		pcaContainer.appendChild(xTextField);
		pcaContainer.appendChild(createDiv('', '', ''));
		var yAxis = createDiv('variablesType', 'yAxisDiv', 'y - axis');
		yAxis.setAttribute('title', 'which principal component should be represented on the y axis');
		var yTextField = createTextField('plotDialogElement', 'pcaYTextField', '2');
		pcaContainer.appendChild(yAxis);
		yTextField.setAttribute('title', 'which principal component should be represented on the y axis');
		pcaContainer.appendChild(yTextField);

		pcaContainer.appendChild(createHr());
		pcaContainer.appendChild(createDiv('variablesType', '', 'Used variables for PCA'));
		var tmpNames;
		if (typeOfSelectedVariableGroup != "allGroups") {
		    tmpNames = getDataFromGivenIndexes(currentData.names, currentVariablesGroup)
		}
		else {
		    tmpNames = currentData.names;
		}
		for (var i = 0; i < tmpNames.length; i++) {
		    pcaContainer.appendChild(createDiv('names', '', tmpNames[i]));
		    var cb = createCheckBox('pcaVariablesCheckBox', 'pca_' + tmpNames[i], tmpNames[i]);
		    cb.checked = true;
		    pcaContainer.appendChild(cb);
		    pcaContainer.appendChild(createBr());
		}


        pcaContainer.appendChild(createHr());
        pcaContainer.appendChild(createButton('btn', 'buttonVariable', 'OK', 'getPCAOptions()'));
    }
	else{
		pcaContainer.appendChild(createH4Title('PCA methods can\'t be applied on chosen data!'));
	}
};

getPCAOptions = function () {
    var pcaAllowed = true;
    var tmpNames;
    var tmpVariablesTypes;
    var variablesdName = [];
    var x = document.getElementById('pcaXTextField').value;
    var y = document.getElementById('pcaYTextField').value;

    try {
        x = parseInt(x);
        y = parseInt(y);
    }
    catch (err) {
        popUpMessage('ERROR: Invalid value for x or y axis!');
        return;
    }

    if (!(Number(x) === x && x % 1 === 0)) {
        popUpMessage('ERROR: Invalid value for x axis!');
        return;
    }

    if (!(Number(y) === y && y % 1 === 0)) {
        popUpMessage('ERROR: Invalid value for y axis!');
        return;
    }

    if (typeOfSelectedVariableGroup != "allGroups") {
        tmpNames = getDataFromGivenIndexes(currentData.names, currentVariablesGroup);
        tmpVariablesTypes = getDataFromGivenIndexes(currentData.variablesTypes, currentVariablesGroup);
    }
    else {
        tmpNames = currentData.names;
        tmpVariablesTypes = currentData.variablesTypes;
    }
    var j = 0;
    for (var i = 0; i < tmpNames.length; i++) {
        var variablesElement = document.getElementById('pca_' + tmpNames[i]);
        if (variablesElement != null && document.getElementById('pca_' + tmpNames[i]).checked) {
            if (tmpVariablesTypes[i] != 'numeric') {
                pcaAllowed = false;
            }
            variablesdName[j] = variablesElement.value;
            j++;
        }
    }


    var options = {
        method: document.getElementById('pcaMethodSelect').value,
        x: document.getElementById('pcaXTextField').value,
        y: document.getElementById('pcaYTextField').value,
        variablesdName: variablesdName
    };

	if(typeOfSelectedVariableGroup == 'externals'){
	    options["scale"] = document.getElementById('pcaScaleCheckBox').checked;
	    options['log'] = document.getElementById('pcaLogCheckBox').checked;
	}

	options["groupData"] = currentVariablesGroup;
    options["type"] = typeOfSelectedVariableGroup;
    options["group"] = currentVariablesGroupName;
    options["subset"] = currentSubset;
	
    if (pcaAllowed && variablesdName.length > 1) {
        //showElement('div#pfaOutput');
        Shiny.onInputChange('pca.in', options);

    }
    else {
        popUpMessage('ERROR: PCA can\'t be applied on chosen data!');
    }
};

/**********************************************************************************
********************************** PFA ********************************************
**********************************************************************************/
createPFADialog = function(){
    cleanModalDialog('pfaWell');
    //hideElement('div#pfaOutput');

    var pfaContainer = document.getElementById('pfaWell');
    if(typeOfSelectedVariableGroup == 'transformations'){
        pfaContainer.appendChild(createH4Title('PFA can\'t be applied on transformed data!'));
    } else if (typeOfSelectedVariableGroup == 'compositions' || typeOfSelectedVariableGroup == 'externals') {

        pfaContainer.appendChild(createHr());        
        pfaContainer.appendChild(createDiv('variablesType', '', 'Function'));
        var functionSelector = createSelect('', 'pfaFunctionSelector');
        functionSelector.setAttribute('onclick', 'createPfaFunctionWell(selectedOptions)');
        var firstFunctionOption = createOption('pfaFunctionOption', 'pfa', 'pfa');
        firstFunctionOption.setAttribute('selected', 'selected');
        functionSelector.appendChild(firstFunctionOption);
        if (typeOfSelectedVariableGroup == 'externals') {
            functionSelector.appendChild(createOption('pfaFunctionOption', 'factanal', 'factanal'));
        }
        pfaContainer.appendChild(functionSelector);
        pfaContainer.appendChild(createBr());        
        pfaContainer.appendChild(createDiv('', '', 'Number of Factors'));
        pfaContainer.appendChild(createTextField('', 'numberOfFactorsTextField', '2'));

        if (typeOfSelectedVariableGroup == 'externals') {
            pfaContainer.appendChild(createBr());
            pfaContainer.appendChild(createDiv('', '', 'log'));
            var cb = createCheckBox('pfaLogCheckBox', 'pfaLogCheckBox', 'log');
            cb.checked = false;
            pfaContainer.appendChild(cb);
        }        

        pfaContainer.appendChild(createHr());
        pfaContainer.appendChild(createDiv('createPfaFunctionDiv', 'createPfaFunctionDiv', ''));
        createPfaFunctionWell(functionSelector.selectedOptions);

        pfaContainer.appendChild(createHr());
        var xAxis = createDiv('variablesType', 'xAxisDiv', 'x - axis');
        xAxis.setAttribute('title', 'which factor should be represented on the x axis');
        var xTextField = createTextField('plotDialogElement', 'pfaXTextField', '1');
        xTextField.setAttribute('title', 'which factor should be represented on the x axis');
        pfaContainer.appendChild(xAxis);
        pfaContainer.appendChild(xTextField);
        pfaContainer.appendChild(createDiv('', '', ''));
        var yAxis = createDiv('variablesType', 'yAxisDiv', 'y - axis');
        yAxis.setAttribute('title', 'which factor should be represented on the y axis');
        var yTextField = createTextField('plotDialogElement', 'pfaYTextField', '2');
        yTextField.setAttribute('title', 'which factor should be represented on the y axis');
        pfaContainer.appendChild(yAxis);
        pfaContainer.appendChild(yTextField);

        pfaContainer.appendChild(createHr());
        pfaContainer.appendChild(createDiv('variablesType', '', 'Used variables for Factor Analysis'));
        var tmpNames;
        if (typeOfSelectedVariableGroup != "allGroups") {
            tmpNames = getDataFromGivenIndexes(currentData.names, currentVariablesGroup)
        }
        else {
            tmpNames = currentData.names;
        }
        for (var i = 0; i < tmpNames.length; i++) {
            pfaContainer.appendChild(createDiv('names', '', tmpNames[i]));
            var cb = createCheckBox('pfaVariablesCheckBox', 'pfa_' + tmpNames[i], tmpNames[i]);
            cb.checked = true;
            pfaContainer.appendChild(cb);
            pfaContainer.appendChild(createBr());
        }

        pfaContainer.appendChild(createHr());
        pfaContainer.appendChild(createButton('btn', 'buttonVariable', 'OK', 'getPFAOptions()'));


    }
    else {
        pfaContainer.appendChild(createH4Title('PFA methods can\'t be applied on chosen data!'));
    }
};

getPFAOptions = function () {
    var func = document.getElementById('pfaFunctionSelector').value;
    var pfaAllowed = true;
    var tmpNames;
    var tmpVariablesTypes;
    var variablesdName = [];
    var x = document.getElementById('pfaXTextField').value;
    var y = document.getElementById('pfaYTextField').value;
    var numberOfFactorsTextField = document.getElementById('numberOfFactorsTextField').value;

    try{
        x = parseInt(x);
        y = parseInt(y);
        numberOfFactorsTextField = parseInt(numberOfFactorsTextField);
    }
    catch (err) {
        return;
    }
    
    if (!(Number.isInteger(x))) {
        popUpMessage('ERROR: Invalid value for x axis!');
        return;
    }

    if (!(Number(y) === y && y % 1 === 0)) {
        popUpMessage('ERROR: Invalid value for y axis!');
        return;
    }

    if (!(Number(numberOfFactorsTextField) === numberOfFactorsTextField && numberOfFactorsTextField % 1 === 0)) {
        popUpMessage('ERROR: Invalid value for number of Factors!');
        return;
    }

    if (x > numberOfFactorsTextField || y > numberOfFactorsTextField) {
        popUpMessage('ERROR: Too large value x or y axis!');
        return;
    }
    

    if (typeOfSelectedVariableGroup != "allGroups") {
        tmpNames = getDataFromGivenIndexes(currentData.names, currentVariablesGroup);
        tmpVariablesTypes = getDataFromGivenIndexes(currentData.variablesTypes, currentVariablesGroup);
    }
    else {
        tmpNames = currentData.names;
        tmpVariablesTypes = currentData.variablesTypes;
    }
    var j = 0;
    for (var i = 0; i < tmpNames.length; i++) {
        var variablesElement = document.getElementById('pfa_' + tmpNames[i]);
        if (variablesElement != null && document.getElementById('pfa_' + tmpNames[i]).checked) {
            if (tmpVariablesTypes[i] != 'numeric') {
                pfaAllowed = false;
            }
            variablesdName[j] = variablesElement.value;
            j++;
        }
    }
    var options = {
        func: func,
        group: currentVariablesGroupName,
        numberOfFactorsTextField: document.getElementById('numberOfFactorsTextField').value,
        x: document.getElementById('pfaXTextField').value,
        y: document.getElementById('pfaYTextField').value,
        score: document.getElementById('pfaScoreSelector').value,
        rotation: document.getElementById('pfaRotationSelector').value,
        variablesdName: variablesdName,
        type: typeOfSelectedVariableGroup
    };

    if (typeOfSelectedVariableGroup == 'compositions') {

    }
    else {
        options['log'] = document.getElementById('pfaLogCheckBox').checked;
        if (func == 'pfa') {
              options['pfaRobust'] = document.getElementById('pfaRobustSelector').value;
        }
    }
    if (pfaAllowed) {
        //showElement('div#pfaOutput');
        Shiny.onInputChange('pfa.in', options);
        
    }
    else {
        popUpMessage('ERROR: Factor analysis can\'t be applied on chosen data!');
    }
    
};

createPfaFunctionWell = function (selectedOptions) {
    cleanModalDialog('createPfaFunctionDiv');
    var pfaContainer = document.getElementById('createPfaFunctionDiv');

    pfaContainer.appendChild(createDiv('variablesType', '', 'Score'));
    var scoreSelector = createSelect('', 'pfaScoreSelector');
    var firstScoreOption = createOption('pfaScoreOption', 'regression', 'regression');
    firstScoreOption.setAttribute('selected', 'selected');
    scoreSelector.appendChild(firstScoreOption);
    scoreSelector.appendChild(createOption('pfaScoreOption', 'Bartlett', 'Bartlett'));
    pfaContainer.appendChild(scoreSelector);

    pfaContainer.appendChild(createDiv('variablesType', '', 'Rotation'));
    var rotationSelector = createSelect('', 'pfaRotationSelector');
    var firstRotationOption = createOption('pfaRotationOption', 'varimax', 'varimax');
    firstRotationOption.setAttribute('selected', 'selected');
    rotationSelector.appendChild(firstRotationOption);
    rotationSelector.appendChild(createOption('pfaRotationOption', 'none', 'none'));
    pfaContainer.appendChild(rotationSelector);



    if (selectedOptions[0].value == 'pfa') {

        pfaContainer.appendChild(createDiv('variablesType', '', 'Type'));
        var robustSelector = createSelect('', 'pfaRobustSelector');
        var firstRobustOption = createOption('pfaRobustOption', 'robust', 'robust');
        firstRobustOption.setAttribute('selected', 'selected');
        robustSelector.appendChild(firstRobustOption);
        robustSelector.appendChild(createOption('pfaRobustOption', 'standard', 'standard'));
        pfaContainer.appendChild(robustSelector);
    }
    else if (selectedOptions[0].value == 'factanal') {

    }
};


/**********************************************************************************
********************************** Discriminant Analysis ***************************
**********************************************************************************/
createDADialog = function () {
    cleanModalDialog('daWell');
    var daContainer = document.getElementById('daWell');
    if(typeOfSelectedVariableGroup == 'transformations'){
        daContainer.appendChild(createH4Title('Discriminant Analysis can\'t be applied on transformed data!'));
    } else if (typeOfSelectedVariableGroup == 'compositions' || typeOfSelectedVariableGroup == 'externals') {

        daContainer.appendChild(createHr());
        daContainer.appendChild(createDiv('', '', 'Function'));
        var functionSelector = createSelect('', 'daFunctionSelector');
        functionSelector.setAttribute('onclick', 'createDaFunctionWell(selectedOptions)');
        functionSelector.appendChild(createOption('daFunctionOption', 'daFisher', 'daFisher'));
        functionSelector.appendChild(createOption('daFunctionOption', 'LDA', 'LDA'));
        functionSelector.appendChild(createOption('daFunctionOption', 'QDA', 'QDA'));
        daContainer.appendChild(functionSelector);

        daContainer.appendChild(createDiv('variablesType', '', 'Type'));
        var robustDaSelector = createSelect('', 'daRobustSelector');
        var firstDaRobustOption = createOption('daRobustOption', 'robust', 'robust');
        firstDaRobustOption.setAttribute('selected', 'selected');
        robustDaSelector.appendChild(firstDaRobustOption);
        robustDaSelector.appendChild(createOption('daRobustOption', 'standard', 'standard'));
        daContainer.appendChild(robustDaSelector);

        daContainer.appendChild(createHr());
        var xAxis = createDiv('variablesType', 'xAxisDiv', 'x - axis');
        xAxis.setAttribute('title', 'which score should be represented on the x axis');
        var xTextField = createTextField('plotDialogElement', 'daXTextField', '1');
        daContainer.appendChild(xAxis);
        xTextField.setAttribute('title', 'which score should be represented on the x axis');
        daContainer.appendChild(xTextField);
        daContainer.appendChild(createDiv('', '', ''));
        var yAxis = createDiv('variablesType', 'yAxisDiv', 'y - axis');
        yAxis.setAttribute('title', 'which score should be represented on the y axis');
        var yTextField = createTextField('plotDialogElement', 'daYTextField', '2');
        daContainer.appendChild(yAxis);
        yTextField.setAttribute('title', 'which score should be represented on the y axis');
        daContainer.appendChild(yTextField);
        daContainer.appendChild(createHr());

        daContainer.appendChild(createDiv('', '', 'Grouping Variable'));
        var groupingVariableSelector = createSelect('', 'groupingVariableSelector');
        groupingVariableSelector.setAttribute('onclick', 'createDaVariablesDiv(selectedOptions)');
        var tmpNames;
        if (typeOfSelectedVariableGroup == 'compositions') {
            tmpNames = Object.create(currentData.names);
            for (var i = currentVariablesGroup.length - 1; i >= 0 ; i--) {
                tmpNames.splice(currentVariablesGroup[i], 1);
            }
        }
        else {
            tmpNames = currentData.names;
        }
        for (var i = 0; i < tmpNames.length; i++) {
            groupingVariableSelector.appendChild(createOption('daMethodOption', tmpNames[i], tmpNames[i]));
        }
        daContainer.appendChild(groupingVariableSelector);
        daContainer.appendChild(createHr());

        daContainer.appendChild(createDiv('daVariablesDiv', 'daVariablesDiv', ''));
        createDaVariablesDiv(groupingVariableSelector.selectedOptions);

        daContainer.appendChild(createHr());
        daContainer.appendChild(createButton('btn', 'buttonVariable', 'OK', 'getDaOptions()'));

    }
};

getDaOptions = function () {
    var daAllowed = true;
    var tmpNames;
    var tmpVariablesTypes;
    var variablesdName = [];
    var variablesdNameLogTransf = [];
    var x = document.getElementById('daXTextField').value;
    var y = document.getElementById('daYTextField').value;
    var func = document.getElementById('daFunctionSelector').value;

    try {
        x = parseInt(x);
        y = parseInt(y);
    }
    catch (err) {
        return;
    }

    if (!(Number.isInteger(x))) {
        popUpMessage('ERROR: Invalid value for x axis!');
        return;
    }

    if (!(Number(y) === y && y % 1 === 0)) {
        popUpMessage('ERROR: Invalid value for y axis!');
        return;
    }

    if (typeOfSelectedVariableGroup != "allGroups") {
        tmpNames = getDataFromGivenIndexes(currentData.names, currentVariablesGroup);
        tmpVariablesTypes = getDataFromGivenIndexes(currentData.variablesTypes, currentVariablesGroup);
    }
    else {
        tmpNames = currentData.names;
        tmpVariablesTypes = currentData.variablesTypes;
    }
    var j = 0;
    for (var i = 0; i < tmpNames.length; i++) {
        var variablesElement = document.getElementById('da_' + tmpNames[i]);
        if (variablesElement != null && document.getElementById('da_' + tmpNames[i]).checked) {
            if (tmpVariablesTypes[i] != 'numeric') {
                daAllowed = false;
            }
            variablesdName[j] = variablesElement.value;

            var variablesElementLogTransf = document.getElementById('da_' + tmpNames[i] + '_LogTransf');
            if (typeOfSelectedVariableGroup == 'externals' && variablesElementLogTransf != null) {
                variablesdNameLogTransf[j] = variablesElementLogTransf.checked;
            }

            j++;
        }
    }


    var options = {
        robust: document.getElementById('daRobustSelector').value,
        x: document.getElementById('daXTextField').value,
        y: document.getElementById('daYTextField').value,
        groupingVariable: document.getElementById('groupingVariableSelector').value,
        variablesdName: variablesdName,
        variablesdNameLogTransf:variablesdNameLogTransf,
        type: typeOfSelectedVariableGroup,
        func: func
    };

    if (func != 'daFisher') {
        hideElement('#da.Plot');
        hideElement('#daDownloadScors');
        hideElement('#daDownloadLoadings');

    }
    else {
        showElement('#da.Plot');
        showElement('#daDownloadScors');
        showElement('#daDownloadLoadings');
    }


    if (daAllowed) {
        Shiny.onInputChange('da.in', options);

    }
    else {
        popUpMessage('ERROR: Discriminant Analysis can\'t be applied on chosen data!');
    }
}

createDaVariablesDiv = function (selectedOptions) {
    cleanModalDialog('daVariablesDiv');

    var container = document.getElementById('daVariablesDiv');
    container.appendChild(createDiv('', '', 'Non Grouping Variable'));
    container.appendChild(createDiv('', '', 'Log'));
    var tmpNames;
    if (typeOfSelectedVariableGroup != "allGroups") {
        tmpNames = getDataFromGivenIndexes(currentData.names, currentVariablesGroup)
    }
    else {
        tmpNames = currentData.names;
    }
    for (var i = 0; i < tmpNames.length; i++) {
        if (tmpNames[i] != selectedOptions[0].value) {
            container.appendChild(createDiv('names', '', tmpNames[i]));
            var cb = createCheckBox('daVariablesCheckBox', 'da_' + tmpNames[i], tmpNames[i]);
            //cb.checked = true;
            container.appendChild(cb);
            if (typeOfSelectedVariableGroup == 'externals') {
                container.appendChild(createCheckBox('daVariablesLogTransfCheckBox', 'da_' + tmpNames[i] + '_LogTransf', ''));
            }
            container.appendChild(createBr());
        }
    }

};



 /**********************************************************************************
********************************** ClusterAnalysis *********************************
**********************************************************************************/
 createClusterAnalysisDialog = function(){
	cleanModalDialog('clustWell');
	var clustContainer = document.getElementById('clustWell');

	if (typeOfSelectedVariableGroup == 'transformations') {
	    pfaContainer.appendChild(createH4Title('PFA can\'t be applied on transformed data!'));
	} else if (typeOfSelectedVariableGroup == 'compositions' || typeOfSelectedVariableGroup == 'externals') {

		clustContainer.appendChild(createHr());
        clustContainer.appendChild(createDiv('','', 'Function'));
		var functionSelector = createSelect('', 'clusterFunctionSelector');
        functionSelector.setAttribute('onclick','createClustFunctionWell(selectedOptions)');
        functionSelector.appendChild(createOption('clustFunctionOption', 'HClust', 'HClust'));
        functionSelector.appendChild(createOption('clustFunctionOption', 'Kmeans', 'Kmeans'));
		functionSelector.appendChild(createOption('clustFunctionOption', 'MClust', 'MClust'));
		clustContainer.appendChild(functionSelector);

        clustContainer.appendChild(createDiv('clustNumberOfClusters', 'clustNumberOfClusters', 'Number of Clusters'));
		clustContainer.appendChild(createTextField('', 'numberOfClustersTextField', '4'));
		clustContainer.appendChild(createBr());


		if (typeOfSelectedVariableGroup == 'compositions') {
		    clustContainer.appendChild(createBr());
		    clustContainer.appendChild(createDiv('', '', 'ilr'));
		    var cb = createCheckBox('clustIlrCheckBox', 'clustIlrCheckBox', 'ilr');
		    cb.checked = true;
		    clustContainer.appendChild(cb);
		}
		else {
		    clustContainer.appendChild(createDiv('names', '', 'log'));
		    var cb = createCheckBox('clustLogCheckBox', 'clustLogCheckBox', 'log');
		    cb.checked = false;
		    clustContainer.appendChild(cb);
		    clustContainer.appendChild(createBr());
		    clustContainer.appendChild(createDiv('names', '', 'scale'));
		    var cb2 = createCheckBox('clustScaleCheckBox', 'clustScaleCheckBox', 'scale');
		    cb2.checked = true;
		    clustContainer.appendChild(cb2);
		}
		clustContainer.appendChild(createBr());

		clustContainer.appendChild(createHr());
        clustContainer.appendChild(createDiv('', 'defineClustFunctionContainer', ''));
        clustContainer.appendChild(createBr());

        clustContainer.appendChild(createHr());
        createClustFunctionWell(functionSelector.selectedOptions);

        var xAxis = createDiv('variablesType', 'xAxisDiv', 'x - axis');
        //if (currentData.ids != null) {
	    //    var xTextField = (currentData.coords);
	    //    var tet = (currentData.coords['id1']);
	    //}
	    //else {
            var xTextField = createTextField('plotDialogElement', 'clustXTextField', currentData.names[1]);
	    //}
        
        clustContainer.appendChild(xAxis);
        xTextField.setAttribute('placeholder', 'eg: ' + currentData.names[Math.ceil(currentData.names.length / 2)]);
        clustContainer.appendChild(xTextField);
        var yAxis = createDiv('variablesType', 'yAxisDiv', 'y - axis');
        var yTextField = createTextField('plotDialogElement', 'clustYTextField', currentData.names[0]);
        clustContainer.appendChild(yAxis);
        yTextField.setAttribute('placeholder', 'eg: ' + currentData.names[0]);
        clustContainer.appendChild(yTextField);
        clustContainer.appendChild(createHr());

        clustContainer.appendChild(createDiv('variablesType', '', 'Used variables for Cluster Analysis'));
        var tmpNames;
        if (typeOfSelectedVariableGroup != "allGroups") {
            tmpNames = getDataFromGivenIndexes(currentData.names, currentVariablesGroup)
        }
        else {
            tmpNames = currentData.names;
        }
        for (var i = 0; i < tmpNames.length; i++) {

            clustContainer.appendChild(createDiv('names', '', tmpNames[i]));
            var cb = createCheckBox('clusterVariablesCheckBox', 'cluster_' + tmpNames[i], tmpNames[i]);
            //cb.checked = true;
            clustContainer.appendChild(cb);
            clustContainer.appendChild(createBr());
            
        }

        clustContainer.appendChild(createButton('btn', 'buttonVariable', 'OK', 'getClusterAnalysis();'));
	}
	else{
	    clustContainer.appendChild(createH4Title('Cluster analysis can\'t be applied on chosen data!'));
	}
 };
 
 createClustFunctionWell = function(selectedOptions){
	cleanModalDialog('defineClustFunctionContainer');
	var defineClustFunctionContainer = document.getElementById('defineClustFunctionContainer');
    if(selectedOptions[0].value == 'HClust'){
        defineClustFunctionContainer.appendChild(createDiv('variablesType', '', 'Method'));
        var functionSelector = createSelect('', 'clusterHClustMethodSelector');
        functionSelector.appendChild(createOption('clustHClustMethodOption', 'ward.D', 'ward.D'));
        functionSelector.appendChild(createOption('clustHClustMethodOption', 'ward.D2', 'ward.D2'));
        defineClustFunctionContainer.appendChild(functionSelector);
        document.getElementById('clustNumberOfClusters').innerHTML = 'Number of Clusters';
    }
    else if(selectedOptions[0].value == 'Kmeans'){
        document.getElementById('clustNumberOfClusters').innerHTML = 'Number of Clusters';
    }
	else if(selectedOptions[0].value == 'MClust'){
	    document.getElementById('clustNumberOfClusters').innerHTML = 'Max Number of Clusters';
    }
	else{
	defineClustFunctionContainer.appendChild(createH4Title('Cluster analysis can\'t be applied on chosen function!'));
	}
};
 
 getClusterAnalysis = function () {
     var func = document.getElementById('clusterFunctionSelector').value;
     var options = {
         func: func,
         group: currentVariablesGroupName,
         numberOfClusters: document.getElementById('numberOfClustersTextField').value,
         type: typeOfSelectedVariableGroup
     };
     var x = document.getElementById('clustXTextField').value;
     var y = document.getElementById('clustYTextField').value;
     var tmpNames;
     var tmpVariablesTypes;
     var clustAllowed = true;
     var variablesdName = [];

     if (x == "" && y == "") {
         popUpMessage('ERROR: all textfields are empty!');
         return;
     }
     if (!doesGivenVariableExist(x)) {
         popUpMessage('ERROR: variable "' + x + '" does not exist on this data-set!');
         return;
     }

     if (!doesGivenVariableExist(y)) {
         popUpMessage('ERROR: variable "' + y + '" does not exist on this data-set!');
         return;
     }
     options['x'] = x;
     options['y'] = y;

     if (typeOfSelectedVariableGroup != "allGroups") {
         tmpNames = getDataFromGivenIndexes(currentData.names, currentVariablesGroup);
         tmpVariablesTypes = getDataFromGivenIndexes(currentData.variablesTypes, currentVariablesGroup);
     }
     else {
         tmpNames = currentData.names;
         tmpVariablesTypes = currentData.variablesTypes;
     }
     var j = 0;
     for (var i = 0; i < tmpNames.length; i++) {
         var variablesElement = document.getElementById('cluster_' + tmpNames[i]);
         if (variablesElement != null && document.getElementById('cluster_' + tmpNames[i]).checked) {
             if (tmpVariablesTypes[i] != 'numeric') {
                 clustAllowed = false;
             }
             variablesdName[j] = variablesElement.value;
             j++;
         }
     }
     options['variablesdName'] = variablesdName;

     if (typeOfSelectedVariableGroup == 'compositions') {
         options['ilr'] = document.getElementById('clustIlrCheckBox').checked;
     }
     else {
         options['log'] = document.getElementById('clustLogCheckBox').checked;
         options['scale'] = document.getElementById('clustScaleCheckBox').checked;
     }
	
	
     if (func == 'HClust') {
         options['method'] = document.getElementById('clusterHClustMethodSelector').value;
         cleanModalDialog('clust.BicPlot');
         cleanModalDialog('clust.OptimalCluster');
         cleanModalDialog('clust.ClusterVector');
	}
     else if (func == 'Kmeans') {
         cleanModalDialog('clust.Dendrogram');
         cleanModalDialog('clust.BicPlot');
         cleanModalDialog('clust.OptimalCluster');
         cleanModalDialog('clust.ClusterVector');
    }
     else if (func == 'MClust') {
         cleanModalDialog('clust.Dendrogram');
	}
     if (clustAllowed) {
         cleanModalDialog('clustChooseCluster');
         var clustChooseClusterContainer = document.getElementById('clustChooseCluster');
         var clustChooseClusterSelector = createSelect('', 'clustChooseClusterSelector');
         for (var i = 1; i <= document.getElementById('numberOfClustersTextField').value; i++) {
             clustChooseClusterSelector.appendChild(createOption('clustChooseClusterSelector', i, i));
         }
	    Shiny.onInputChange('clust.in', options);
	}
	else {
	    popUpMessage('ERROR: Cluster analysis can\'t be applied on chosen data!');
	}
	
 };
 
 
 
 
  /**********************************************************************************
********************************** Regression ***************************************
**********************************************************************************/
createRegressionDialog = function(){
	cleanModalDialog('regressionWell');
	hideElement('div#regressionVariablesDiv');
	var regressionContainer = document.getElementById('regressionWell');
		
	if (typeOfSelectedVariableGroup == 'transformations') {
	    pfaContainer.appendChild(createH4Title('PFA can\'t be applied on transformed data!'));
	} else if (typeOfSelectedVariableGroup == 'compositions' || typeOfSelectedVariableGroup == 'externals') {
		regressionContainer.appendChild(createHr());
        regressionContainer.appendChild(createDiv('variablesType','', 'Method'));
        var methodSelector = createSelect('', 'regressionMethodSelector');
        if (typeOfSelectedVariableGroup == 'compositions') {
            var firstOption = createOption('regressionMethodOption', 'lmCoDaX', 'lmCoDaX');
            firstOption.setAttribute('selected', 'selected');
            methodSelector.appendChild(firstOption);
            regressionContainer.appendChild(methodSelector);

            regressionContainer.appendChild(createBr());
            regressionContainer.appendChild(createDiv('variablesType', '', 'Type'));
            var regressionRobustSelector = createSelect('', 'regressionRobustSelector');
            var regressionFirstRobustOption = createOption('regressionRobustOption', 'robust', 'robust');
            regressionFirstRobustOption.setAttribute('selected', 'selected');
            regressionRobustSelector.appendChild(regressionFirstRobustOption);
            regressionRobustSelector.appendChild(createOption('regressionRobustOption', 'classical', 'standard'));
            regressionContainer.appendChild(regressionRobustSelector);
        }
        else {
            var firstOption = createOption('regressionMethodOption', 'lm', 'lm');
            firstOption.setAttribute('selected', 'selected');
            methodSelector.appendChild(firstOption);
            methodSelector.appendChild(createOption('regressionMethodOption', 'lmrob', 'lmrob'));
            regressionContainer.appendChild(methodSelector);
        }	
		regressionContainer.appendChild(createDiv('','', 'Dependent Variable'));
		var dependentVariableSelector = createSelect('', 'dependentVariableSelector');
		dependentVariableSelector.setAttribute('onclick','createRegressionVariablesDiv(selectedOptions)');
		var tmpNames;
		if (typeOfSelectedVariableGroup == 'compositions') {
		    tmpNames = Object.create(currentData.names);
		    for (var i = currentVariablesGroup.length-1; i >=0 ; i--) {
		        tmpNames.splice(currentVariablesGroup[i], 1);		        
		    }
		}
		else {
			tmpNames = currentData.names;
		}
		for(var i = 0; i < tmpNames.length; i++){
			dependentVariableSelector.appendChild(createOption('regressionMethodOption', tmpNames[i], tmpNames[i]));
		}
		regressionContainer.appendChild(dependentVariableSelector);
		regressionContainer.appendChild(createDiv('names', '', 'log'));
		var cb = createCheckBox('regressionDependentVariableLogCheckBox', 'regressionDependentVariableLogCheckBox', 'log');
		regressionContainer.appendChild(cb);
		regressionContainer.appendChild(createBr());
		regressionContainer.appendChild(createHr());
		
		regressionContainer.appendChild(createDiv('regressionVariablesDiv','regressionVariablesDiv', ''));
		regressionContainer.appendChild(createHr());
		createRegressionVariablesDiv(dependentVariableSelector.selectedOptions);
        regressionContainer.appendChild(createButton('btn', 'buttonVariable', 'OK', 'getRegression();'));
	}
	else{
	    regressionContainer.appendChild(createH4Title('Regression analysis can\'t be applied with this data!'));
	}
 };

 
 getRegression = function(){
	var dependentVariables = {};
	var regressionMethod = document.getElementById('regressionMethodSelector').value;
	var dependentVariable = document.getElementById('dependentVariableSelector').value;
	var variablesdName = [];
	var variablesdNameLogTransf = [];
	var regressionAllowed = true;	
	var tmpNames;
	var tmpVariablesTypes;	
	var logDependentVariable = document.getElementById('regressionDependentVariableLogCheckBox').checked;
    
	
	if(typeOfSelectedVariableGroup != "allGroups"){
		tmpNames = getDataFromGivenIndexes(currentData.names, currentVariablesGroup);
		tmpVariablesTypes = getDataFromGivenIndexes(currentData.variablesTypes, currentVariablesGroup);
	}
	else{
		tmpNames = currentData.names;
		tmpVariablesTypes = currentData.variablesTypes;
	}
	var j=0;
    for(var i = 0; i < tmpNames.length; i++){
		var variablesElement = document.getElementById('regression_' + tmpNames[i]);
        if(variablesElement != null && document.getElementById('regression_' + tmpNames[i]).checked){
			if(tmpVariablesTypes[i] != 'numeric'){
				regressionAllowed = false;
			}
			variablesdName[j] = variablesElement.value;

			var variablesElementLogTransf = document.getElementById('regression_' + tmpNames[i] + '_LogTransf');
			if (typeOfSelectedVariableGroup == 'externals' && variablesElementLogTransf != null) {
			    variablesdNameLogTransf[j] = variablesElementLogTransf.checked;
			}
			 
			j++;
        }
    }
	
	var options = {
            regressionMethod: regressionMethod,
			dependentVariable: dependentVariable,
			variablesdName: variablesdName,
			variablesdNameLogTransf: variablesdNameLogTransf,
			logDependentVariable: logDependentVariable,
			type: typeOfSelectedVariableGroup
        };
        options['group'] = currentVariablesGroupName;
	
	if(regressionMethod == 'lm'){
	    cleanModalDialog('regression.diagnostic5');
	}
	else if(regressionMethod == 'lmrob'){
        
    }
	else if (regressionMethod == 'lmCoDaX') {
	    options['lmCoDaX_RobustSelector'] = document.getElementById('regressionRobustSelector').value;
	    cleanModalDialog('regression.diagnostic5');
       
    }
	if(regressionAllowed){
	    Shiny.onInputChange('regression.in', options);
	}
	else{
	popUpMessage('ERROR: Regression analysis can\'t be applied on chosen data!');
	}
	
 };
 
 
 createRegressionVariablesDiv = function(selectedOptions){
	cleanModalDialog('regressionVariablesDiv');
	
    var container = document.getElementById('regressionVariablesDiv');
    container.appendChild(createDiv('', '', 'Independent Variables'));
    container.appendChild(createDiv('', '', 'Log'));
	var tmpNames;
	if(typeOfSelectedVariableGroup != "allGroups"){
		tmpNames = getDataFromGivenIndexes(currentData.names, currentVariablesGroup)
	}
	else{
		tmpNames = currentData.names;
	}
	for(var i = 0; i < tmpNames.length; i++){
		if(tmpNames[i] != selectedOptions[0].value){
			container.appendChild(createDiv('names', '', tmpNames[i]));
			var cb = createCheckBox('regressionVariablesCheckBox', 'regression_' + tmpNames[i],tmpNames[i]);
			//cb.checked = true;
			container.appendChild(cb);
			if (typeOfSelectedVariableGroup == 'externals') {
                container.appendChild(createCheckBox('regressionVariablesLogTransfCheckBox', 'regression_' + tmpNames[i] + '_LogTransf',''));
			}
			container.appendChild(createBr());
		}
    }
	
    showElement('div#regressionVariablesDiv');
 };



 /**********************************************************************************
 ********************************** Outlier Detection ***************************
 **********************************************************************************/
 createODDialog = function () {
     cleanModalDialog('outlierWell');
     var odContainer = document.getElementById('outlierWell');
     if (typeOfSelectedVariableGroup == 'transformations') {
         daContainer.appendChild(createH4Title('Outlier Detection can\'t be applied on transformed data!'));
     } else if (typeOfSelectedVariableGroup == 'compositions' || typeOfSelectedVariableGroup == 'externals') {

         h2 = document.createElement("h4");
         h2.textContent = "Outlier Detection - outCoDa";
         odContainer.appendChild(h2);


         odContainer.appendChild(createHr());
         var oDQuantile = createDiv('variablesType', 'oDQuantile', 'quantile');
         oDQuantile.setAttribute('title', 'corresponding to a significance level, is used as a cut-off value for outlier identification');
         var oDQuantileTextField = createTextField('plotDialogElement', 'oDQuantileTextField', '0.975');
         odContainer.appendChild(oDQuantile);
         oDQuantileTextField.setAttribute('title', '0 < quantile <= 1');
         odContainer.appendChild(oDQuantileTextField);
         odContainer.appendChild(createDiv('', '', ''));
         var oDH = createDiv('variablesType', 'oDH', 'h');
         oDH.setAttribute('title', 'the size of the subsets for the robust covariance estimation according the MCDestimator for which the determinant is minimized');
         var oDHTextField = createTextField('plotDialogElement', 'oDHTextField', '0.5');
         odContainer.appendChild(oDH);
         oDHTextField.setAttribute('title', '0 < h <= 1');
         odContainer.appendChild(oDHTextField);
         odContainer.appendChild(createHr());

         odContainer.appendChild(createDiv('', '', 'Used variables for Outlier Detection'));
         odContainer.appendChild(createDiv('', '', 'Log'));
         var tmpNames;
         if (typeOfSelectedVariableGroup != "allGroups") {
             tmpNames = getDataFromGivenIndexes(currentData.names, currentVariablesGroup)
         }
         else {
             tmpNames = currentData.names;
         }
         for (var i = 0; i < tmpNames.length; i++) {
                 odContainer.appendChild(createDiv('names', '', tmpNames[i]));
                 var cb = createCheckBox('oDVariablesCheckBox', 'od_' + tmpNames[i], tmpNames[i]);
                 odContainer.appendChild(cb);
                 if (typeOfSelectedVariableGroup == 'externals') {
                     odContainer.appendChild(createCheckBox('oDVariablesLogTransfCheckBox', 'od_' + tmpNames[i] + '_LogTransf', ''));
                 }
                 odContainer.appendChild(createBr());
             
         }

         odContainer.appendChild(createHr());
         odContainer.appendChild(createButton('btn', 'buttonVariable', 'OK', 'getoDOptions()'));

     }
 };

 getoDOptions = function () {
     var oDAllowed = true;
     var tmpNames;
     var tmpVariablesTypes;
     var variablesdName = [];
     var variablesdNameLogTransf = [];
     var quantile = document.getElementById('oDQuantileTextField').value;
     var h = document.getElementById('oDHTextField').value;

     
     try {
         quantile = parseFloat(quantile);
         h = parseFloat(h);
     }
     catch (err) {
         return;
     }
     
     if (quantile <= 0 || quantile >=1) {
         popUpMessage('ERROR: Invalid value for quantile!');
         return;
     }

     if (h <= 0 || h >= 1) {
         popUpMessage('ERROR: Invalid value for h!');
         return;
     }
     
     if (typeOfSelectedVariableGroup != "allGroups") {
         tmpNames = getDataFromGivenIndexes(currentData.names, currentVariablesGroup);
         tmpVariablesTypes = getDataFromGivenIndexes(currentData.variablesTypes, currentVariablesGroup);
     }
     else {
         tmpNames = currentData.names;
         tmpVariablesTypes = currentData.variablesTypes;
     }
     var j = 0;
     for (var i = 0; i < tmpNames.length; i++) {
         var variablesElement = document.getElementById('od_' + tmpNames[i]);
         if (variablesElement != null && document.getElementById('od_' + tmpNames[i]).checked) {
             if (tmpVariablesTypes[i] != 'numeric') {
                 oDAllowed = false;
             }
             variablesdName[j] = variablesElement.value;

             var variablesElementLogTransf = document.getElementById('od_' + tmpNames[i] + '_LogTransf');
             if (typeOfSelectedVariableGroup == 'externals' && variablesElementLogTransf != null) {
                 variablesdNameLogTransf[j] = variablesElementLogTransf.checked;
             }

             j++;
         }
     }


     var options = {
         quantile: document.getElementById('oDQuantileTextField').value,
         h: document.getElementById('oDHTextField').value,
         variablesdName: variablesdName,
         variablesdNameLogTransf: variablesdNameLogTransf,
         type: typeOfSelectedVariableGroup
     };

     if (oDAllowed) {
         Shiny.onInputChange('od.in', options);

     }
     else {
         popUpMessage('ERROR: Outlier Detection can\'t be applied on chosen data!');
     }
 }



/**********************************************************************************
 ************************************** PLOTS ************************************
 *********************************************************************************/

var plotContainerParent = null;
var nrPlotId = 0;
var dataInfo = [];
var selectedPoints = [];

createPlotContainer = function(){
    nrPlotId++;
    var genDiv = createDiv('completeContainer', 'completeContainer' + nrPlotId, '');
    var div = createDiv('well plotContainer', 'plotContainer' + nrPlotId, '');
    div.appendChild(createImage('','plus', 'plus.png', 'createPlotDialog()'));
    genDiv.appendChild(div);
    var minDiv = createDiv('minus', ''+nrPlotId, '', 'deletePlot(this.id)');
    var icon = document.createElement('i');
    icon.setAttribute('class', 'icon-minus-sign');
    minDiv.appendChild(icon);
    genDiv.appendChild(minDiv);
    var plusDiv = createDiv('plus', 'plus' + nrPlotId, '', 'createSubsetNameFieldFromPoints('+ nrPlotId +')');
    var plusIcon = document.createElement('i');
    plusIcon.setAttribute('class', 'icon-plus-sign');
    plusDiv.appendChild(plusIcon);

    genDiv.appendChild(plusDiv);
    plotContainerParent.appendChild(genDiv);
    hideElement('#' + nrPlotId);
    hideElement('#plus' + nrPlotId);
};

deletePlot = function(id){
    plotContainerParent.removeChild(document.getElementById('completeContainer' + id));
};

doesGivenVariableExist = function(variable){
    if(currentData.names.indexOf(variable) != -1){
        return true;
    }else{
        var names = getNames(currentData.transformations);
        for(var i = 0; i < names.length; i++){
            if((currentData.transformations[names[i]])[variable] != undefined){
                return true;
            }
        }
    }

    return false;
};

getDataFromTransformation = function(variable){
    var names = getNames(currentData.transformations);
    for(var i = 0; i < names.length; i++){
        if((currentData.transformations[names[i]])[variable] != undefined){
            return (currentData.transformations[names[i]])[variable];
        }
    }

    return [];
};

createPlotDialog = function(){
    if(plotContainerParent == null){
        plotContainerParent = document.getElementById('completeContainer0').parentNode;
    }
    if(currentData.data != null){
        modalDialog.setAttribute('id', 'plotDialog');
        modalDialog.setAttribute('style', 'width:500px;');
        cleanModalDialog('plotDialog');

        modalDialog.appendChild(createHr());
        modalDialog.appendChild(createDiv('variablesType','', 'Plot Type'));
        var selector = createSelect('plotDialogElement', 'plotTypeSelector');
        selector.appendChild(createOption('', 'bar', 'Bar Plot'));
        selector.appendChild(createOption('', 'groupbar', 'Group Bar Plot'));
        selector.appendChild(createOption('', 'scatter', 'Scatter Plot'));
        selector.appendChild(createOption('', 'boxplot', 'Boxplot'));
        selector.setAttribute('onchange', 'createPlotParameters(this.selectedOptions[0].value)');
        modalDialog.appendChild(selector);
        modalDialog.appendChild(createHr());
        modalDialog.appendChild(createDiv('','plotTypeParameterContainer', ''));
        var checkBox = createCheckBox('plotDialogElement', 'plotSubsetDataCheckBox', '');
        checkBox.setAttribute('style', 'margin-left: 15px; float:left; color:"#66CCFF"');
        modalDialog.appendChild(checkBox);
        var checkBoxText = createDiv('', '', 'Use only subset data');
        checkBoxText.setAttribute('style', 'padding-left: 20px; float:left;');
        modalDialog.appendChild(checkBoxText);
        modalDialog.appendChild(createHr());
        modalDialog.appendChild(okButton);
        modalDialog.appendChild(cancelButton);
        cancelButton.setAttribute('onclick', 'hideElement("#plotDialog"); $(".backgroundDiv").hide();');
        createPlotParameters(selector.selectedOptions[0].value);
        showElement('#plotDialog');
        $('.backgroundDiv').height(getMaxHeight()).show();
    }else{
        popUpMessage('There is no data available! <br> Please import a data-set!');
    }
};

createPlotParameters = function(plotType){
    cleanModalDialog('plotTypeParameterContainer');
    var container = document.getElementById('plotTypeParameterContainer');
    container.appendChild(createDiv('variablesType', '', 'x - axis'));

    if(plotType == 'bar'){
        createBarPlotParameters();
    }else if(plotType == "groupbar"){
        createGroupBarPlotParameters();
    }else if(plotType == "scatter"){
        createScatterPlotParameters();
    }else if(plotType == "boxplot"){
        createBoxPlotParameters();
    }
};

/********************************************************************************
 ************************************ BAR ***************************************
 *******************************************************************************/
createBarPlotParameters = function(){
    var container = document.getElementById('plotTypeParameterContainer');
    var yAxis = createDiv('variablesType', 'yAxisDiv', 'y - axis');
    var yTextField = createTextField('plotDialogElement', 'plotParametersYTextField', '');

    var varSelector = createSelect('plotDialogElement', 'plotParametersXSelector');
    varSelector.appendChild(createOption('', 'factor', 'Factor'));
    varSelector.appendChild(createOption('', 'variables', 'Variables'));
    container.appendChild(varSelector);
    container.appendChild(createDiv('', 'columnPlotParametersXPar', ''));
    varSelector.setAttribute('onchange', 'createBarPlotParametersXPar(this.selectedOptions[0].value)');
    container.appendChild(yAxis);
    yTextField.setAttribute('placeholder', 'Enter function! eg: count, max, mean...');
    container.appendChild(yTextField);
    createBarPlotParametersXPar('factor');


};

createBarPlotParametersXPar = function(type){
    cleanModalDialog('columnPlotParametersXPar');
    var container = document.getElementById('columnPlotParametersXPar');
    var xParametersSelector = createSelect('plotDialogElement', 'variablesBarPlotSelector');
    container.appendChild(xParametersSelector);
    okButton.setAttribute('onclick', 'getDataForVariablesBarPlot()');
    var yTextField = document.getElementById('plotParametersYTextField');
    if(type == 'variables'){
        yTextField.value = '';
        yTextField.disabled = '';
        var children = document.getElementById('variableGroupSelector').children;
        for(var i = 1; i < children.length; i++){
            xParametersSelector.appendChild(createOption(children[i].className, children[i].value, children[i].innerHTML));
            if(children[i].innerHTML == currentVariablesGroupName){
                xParametersSelector.selectedIndex = (i - 1);
            }
        }
    }else{
        yTextField.value = 'count';
        yTextField.disabled = 'disabled';
        for(i = 0; i < currentData.variablesTypes.length; i++){
            if(currentData.variablesTypes[i] == 'factor'){
                xParametersSelector.appendChild(createOption('', currentData.names[i], currentData.names[i]));
            }
        }
    }
};

getDataForVariablesBarPlot = function(){
    var variables = document.getElementById('variablesBarPlotSelector').selectedOptions[0];
    var xAxisType = document.getElementById('plotParametersXSelector').value;
    var functionToUse = document.getElementById('plotParametersYTextField').value;
    var checked = document.getElementById('plotSubsetDataCheckBox').checked;

    if(functionToUse == ""){
        popUpMessage('ERROR: empty function-field!');
    }else{
        if(xAxisType == 'variables'){
            var options = {};
            if(functionToUse == 'count'){
                options = {
                    variablesType: variables.className,
                    variablesName: variables.value,
                    method: 'length',
                    useSubset: checked,
                    currentSubset: currentSubset,
                    title: "Number of observations by " + variables.value,
                    yAxis: "Number of observations"
                };
            }else{
                options = {
                    variablesType: variables.className,
                    variablesName: variables.value,
                    method: functionToUse,
                    useSubset: checked,
                    currentSubset: currentSubset,
                    title: "Observations by " + functionToUse,
                    yAxis: functionToUse + " values"
                };
            }
            Shiny.onInputChange('variablesBarPlot', options);
        }else{
            if(variables  == undefined){
                popUpMessage('ERROR: chosen data doesn\'t contain any factors!');
            }else{
                createCountBarPlotSeries(variables.value)
            }
        }
    }


};

createCountBarPlotSeries = function(xAxisDataName){
    var data = [];
    var checked = document.getElementById('plotSubsetDataCheckBox').checked;

    var factors = currentData.data[xAxisDataName].unique();
    for(var i = 0; i < factors.length; i++){
        if(checked && currentSubset.length > 0){
            var indexes = getAllIndexes(currentData.data[xAxisDataName], factors[i]);
            var nr = 0;
            for(var j = 0; j < indexes.length; j++){
                if(currentSubset.indexOf(indexes[j]) != -1){
                    nr++;
                }
            }
            data.push([factors[i], nr]);
        }else{
            data.push([factors[i], getAllIndexes(currentData.data[xAxisDataName], factors[i]).length]);
        }
    }



    plotBarPlot("Number of observations by " + xAxisDataName, 'Number of observations', data);
    hideElement('#plotDialog');
    $('.backgroundDiv').hide();
    createPlotContainer();
};

createVariablesBarPlotSeries = function(data){
    var result = data.data;
    var dataToPlot = [];
    var names = getNames(result);
    for(var i = 0; i < names.length; i++){
        dataToPlot.push([names[i], result[names[i]]]);
    }
    plotBarPlot(data.title, data.yAxis, dataToPlot);
    hideElement('#plotDialog');
    $('.backgroundDiv').hide();
    createPlotContainer();
};

plotBarPlot = function(title, yAxis, data){
    showElement('#' + nrPlotId);
    dataInfo.push([]);
    selectedPoints.push([]);
    $('#plotContainer' + nrPlotId).highcharts({
        chart: {
            type: 'column',
            zoomType: 'xy'
        },
        title: {
            text: title
        },
        xAxis: {
            type: 'category',
            labels: {
                rotation: -45,
                style: {
                    fontSize: '13px',
                    fontFamily: 'Verdana, sans-serif'
                }
            }
        },
        yAxis: {
            title: {
                text: yAxis
            }
        },
        legend: {
            enabled: false
        },
        tooltip: {
            pointFormat: '<b>{point.y}</b>'
        },
        series: [{
            data: data,
            dataLabels: {
                enabled: true,
                rotation: -90,
                color: '#FFFFFF',
                align: 'right',
                x: 4,
                y: 10,
                style: {
                    fontSize: '13px',
                    fontFamily: 'Verdana, sans-serif',
                    textShadow: '0 0 3px black'
                }
            }
        }]
    });
};

/********************************************************************************
 ********************************* GROUP BAR ************************************
 *******************************************************************************/
createGroupBarPlotParameters = function(){
    var container = document.getElementById('plotTypeParameterContainer');
    var yAxis = createDiv('variablesType', 'yAxisDiv', 'y - axis');
    var yTextField = createTextField('plotDialogElement', 'plotParametersYTextField', '');

    var xFactorSelector = createSelect('plotDialogElement' , 'groupBarPlotFactorSelector');
    container.appendChild(xFactorSelector);
    for(var i = 0; i < currentData.variablesTypes.length; i++){
        if(currentData.variablesTypes[i] == 'factor'){
            xFactorSelector.appendChild(createOption('', currentData.names[i], currentData.names[i]));
        }
    }

    var varToShow = createDiv('variablesType', '', 'Variables to show');
    container.appendChild(varToShow);
    var variablesSelector = createSelect('plotDialogElement','groupBarPlotVariablesSelector');
    var children = document.getElementById('variableGroupSelector').children;
    for(i = 1; i < children.length; i++){
        variablesSelector.appendChild(createOption(children[i].className, children[i].value, children[i].innerHTML));
        if(children[i].innerHTML == currentVariablesGroupName){
            variablesSelector.selectedIndex = (i - 1);
        }
    }
    container.appendChild(variablesSelector);
    container.appendChild(yAxis);
    yTextField.setAttribute('placeholder', 'Enter function! eg: count, max, mean...');
    container.appendChild(yTextField);
    okButton.setAttribute('onclick', 'getGroupBarPlotOptions()');
};

getGroupBarPlotOptions = function(){
    var factor = document.getElementById('groupBarPlotFactorSelector').value;
    var functionToUse = document.getElementById('plotParametersYTextField').value;
    var variables = document.getElementById('groupBarPlotVariablesSelector').selectedOptions[0];
    var checked = document.getElementById('plotSubsetDataCheckBox').checked;
    if(factor == ''){
        popUpMessage('ERROR: chosen data doesn\'t contain any factors!');
    }else if(variables.value == ''){
        popUpMessage('ERROR: chosen data doesn\'t contain any variable-groups!');
    }else if(functionToUse == ""){
        popUpMessage('ERROR: empty function-field!');
    }else{
        var title, yAxis;

        if(functionToUse == 'count'){
            title = "Number of observations for each variable grouped by " + factor;
            yAxis = "Number of observations";
            functionToUse = "length"
        }else{
            title = "Variables " + functionToUse + " grouped by " + factor;
            yAxis = functionToUse + "value";
        }

        var options = {
            factor: factor,
            variablesType: variables.className,
            variablesName: variables.value,
            method: functionToUse,
            useSubset: checked,
            currentSubset: currentSubset,
            title: title,
            yAxis: yAxis
        };

        Shiny.onInputChange('groupBarPlot', options);
    }
};

createGroupBarPlotSeries = function(data){
    var result = data.data;
    var dataToPlot = [];
    var categoriesNames = getNames(result);
    var names = data.names;

    for(var i = 0; i < names.length; i++){
        var tmpData = [];
        for(var j = 0; j < categoriesNames.length; j++){
            tmpData.push(result[categoriesNames[j]][i])
        }
        dataToPlot.push({
            name: names[i],
            data: tmpData
        });
    }


    $('#completeContainer' + nrPlotId).width(1300).height(400);
    $('#plotContainer' + nrPlotId).width(1200).height(400);

    plotGroupBarPlot(data.title, data.yAxis, categoriesNames, dataToPlot);
    hideElement('#plotDialog');
    $('.backgroundDiv').hide();
    createPlotContainer();
};

plotGroupBarPlot = function(title, yAxis, xAxisCategories, series){
    showElement('#' + nrPlotId);
    dataInfo.push([]);
    selectedPoints.push([]);
    $('#plotContainer' + nrPlotId).highcharts({
        chart: {
            type: 'column',
            zoomType: 'xy'
        },
        title: {
            text: title
        },
        xAxis: {
            categories: xAxisCategories
        },
        yAxis: {
            title: {
                text: yAxis
            }
        },
        tooltip: {
            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y}</b></td></tr>',
            footerFormat: '</table>',
            shared: true,
            useHTML: true
        },
        plotOptions: {
            column: {
                pointPadding: 0.2,
                borderWidth: 0
            }
        },
        series: series
    });
};

/********************************************************************************
 ************************************ SCATTER ***********************************
 *******************************************************************************/

createSubsetNameFieldFromPoints = function(index){

    modalDialog.setAttribute('id', 'subsetNameTextFieldDialog');
    modalDialog.setAttribute('style', 'width: 300px;');
    cleanModalDialog('subsetNameTextFieldDialog');
    modalDialog.appendChild(createBr());
    var textField = createTextField('', 'fromPointsSubsetNameTextField', '');
    textField.setAttribute('placeholder', 'Insert subset - name! eg: subset_1');
    textField.setAttribute('style', 'margin-left:10px; width:250px;');
    modalDialog.appendChild(textField);
    modalDialog.appendChild(createBr());
    okButton.setAttribute('onclick', 'createSubsetsFromPoints(' + index + ')');
    modalDialog.appendChild(okButton);
    cancelButton.setAttribute('onclick', 'hideElement("div#subsetNameTextFieldDialog"); $(".backgroundDiv").hide();');
    modalDialog.appendChild(cancelButton);

    showElement('div#subsetNameTextFieldDialog');
    $('.backgroundDiv').height(getMaxHeight()).show();
};

createSubsetsFromPoints = function(index){
    var name = document.getElementById('fromPointsSubsetNameTextField').value;
    if(name == ''){
        popUpMessage('ERROR: name-field is empty!');
        return;
    }

    if(currentData.subsets.length == 0){
        currentData.subsets = {};
    }

    currentData.subsets[name] = selectedPoints[index].slice(0);
    var subset = {};
    subset[name] = selectedPoints[index].slice(0);
    createSubsetSelector();
    setSelectorsValue(currentSubsetName);
    Shiny.onInputChange('defineObservationsFactor', subset);

    var chart = $('#plotContainer' + index).highcharts();
    chart.getSelectedPoints()[0].select();
    hideElement('div#subsetNameTextFieldDialog');
    $('.backgroundDiv').hide();
};

addSelectedPoint = function(selectedPointsIndex, pointIndex){
    selectedPoints[selectedPointsIndex].push(pointIndex);
    if($('#plus' + selectedPointsIndex + ':hidden').length > 0){
        $('#plus' + selectedPointsIndex).show();
    }
};

removeUnselectedPoint = function(selectedPointsIndex, pointIndex){
    selectedPoints[selectedPointsIndex].splice(selectedPoints[selectedPointsIndex].indexOf(pointIndex), 1);
    if(selectedPoints[selectedPointsIndex].length == 0){
        $('#plus' + selectedPointsIndex).hide();
    }
};

createScatterPlotParameters = function(){
    var container = document.getElementById('plotTypeParameterContainer');
    var yAxis = createDiv('variablesType', 'yAxisDiv', 'y - axis');
    var yTextField = createTextField('plotDialogElement', 'plotParametersYTextField', '');

    var xTextField = createTextField('plotDialogElement', 'plotParametersXTextField', '');
    xTextField.setAttribute('placeholder', 'eg: ' + currentData.names[Math.ceil(currentData.names.length/2)]);
    container.appendChild(xTextField);
    container.appendChild(yAxis);
    yTextField.setAttribute('placeholder', 'optional! eg: ' + currentData.names[Math.ceil(currentData.names.length/2) + 2]);
    container.appendChild(yTextField);
    if(currentData.variablesTypes.indexOf('factor') != -1){
        container.appendChild(createDiv('variablesType', '', 'factor'));
        var factorSelector = createSelect('plotDialogElement', 'plotParametersFactorSelector');
        factorSelector.appendChild(createOption('', '', ''));
        for(i = 0; i < currentData.variablesTypes.length; i++){
            if(currentData.variablesTypes[i] == 'factor'){
                factorSelector.appendChild(createOption('', currentData.names[i], currentData.names[i]));
            }
        }
        container.appendChild(factorSelector);
    }
    okButton.setAttribute('onclick', 'getScatterPlotOptions()');
};

getScatterPlotOptions = function(){
    var x = document.getElementById('plotParametersXTextField').value;
    var y = document.getElementById('plotParametersYTextField').value;
    if(x == "" && y == ""){
        popUpMessage('ERROR: all textfields are empty!');
        return;
    }

    if(!doesGivenVariableExist(x)){
        popUpMessage('ERROR: variable "' + x + '" does not exist on this data-set!');
        return;
    }

    if(y != ""){
        if(!doesGivenVariableExist(y)){
            popUpMessage('ERROR: variable "' + y + '" does not exist on this data-set!');
            return;
        }
    }

    var factor = document.getElementById('plotParametersFactorSelector');
    if(factor != null && factor != undefined){
        factor = factor.selectedOptions[0].value;
        if(factor != ""){
            var index = currentData.names.indexOf(factor);
            if(index == -1){
                popUpMessage('ERROR: variable "' + factor + '" does not exist on this data-set!');
                return;
            }else{
                if(currentData.variablesTypes[index] != 'factor'){
                    popUpMessage('ERROR: variable "' + factor + '" is not a factor-variable!');
                    return;
                }
            }
        }
    }else{
        factor = "";
    }

    createScatterPlotSeries(x, y, factor);
};

createScatterPlotSeries = function(x, y, factor){
    var series = [];
    var title;
    var xAxisTitle;
    var yAxisTitle;
    var data = [];
    var checked = document.getElementById('plotSubsetDataCheckBox').checked;
    if(y == ""){
        data = currentData.data[x];
        if(data == null || data == undefined){
            data = getDataFromTransformation(x);
        }

        if(factor == ""){
            if(checked && currentSubset.length != 0){
                var tmp = [];
                for(var i = 0; i < currentSubset.length; i++){
                    tmp.push(data[currentSubset[i]]);
                }
                data = tmp;
            }
            series[0] = {
                type: 'scatter',
                name: x,
                color: plotColors[0],
                data:data
            };
            title = x;

        }else{
            var factors = currentData.data[factor];
            factors = factors.unique();
            for(i = 0; i < factors.length; i ++){
                var indexes = getAllIndexes(currentData.data[factor], factors[i]);
                tmp = [];
                for(var j = 0; j < indexes.length; j++){
                    if(checked && currentSubset.length > 0){
                        if(currentSubset.indexOf(indexes[j]) != -1){
                            tmp.push(data[indexes[j]]);
                        }
                    }else {
                        tmp.push(data[indexes[j]]);
                    }
                }
                series[i] = {
                    name: currentData.data[factor][indexes[0]],
                    color: plotColors[i],
                    data: tmp
                }
            }

            title = x + " grouped by " + factor;
        }
        if(currentData.gemasInfo.UNIT != null || currentData.gemasInfo.UNIT != undefined){
            yAxisTitle = x + ' (' + currentData.gemasInfo.UNIT[currentData.names.indexOf(x)] + ")";
        }else{
            yAxisTitle = x;
        }
        xAxisTitle = 'Index';
        createSingleDataInfo(x, checked);

    }else if(y != ""){
        $('#completeContainer' + nrPlotId).height(550).width(630);
        $('#plotContainer' + nrPlotId).height(550).width(550);
        data = [];
        var xData = currentData.data[x];
        var yData = currentData.data[y];
        if(xData == null || xData == undefined){
            xData = getDataFromTransformation(x);
        }
        if(yData == null || yData == undefined){
            yData = getDataFromTransformation(y);
        }

        if(currentData.gemasInfo.UNIT != null || currentData.gemasInfo.UNIT != undefined){
            xAxisTitle = x + ' (' + currentData.gemasInfo.UNIT[currentData.names.indexOf(x)] + ")";
            yAxisTitle = y + ' (' + currentData.gemasInfo.UNIT[currentData.names.indexOf(y)] + ")";
        }else{
            xAxisTitle = x;
            yAxisTitle = y;
        }

        if(factor == ""){
            if(checked && currentSubset.length != 0){
                var tmp1 = [];
                var tmp2 = [];
                for(i = 0; i < currentSubset.length; i++){
                    tmp1.push(xData[currentSubset[i]]);
                    tmp2.push(yData[currentSubset[i]]);
                }
                xData = tmp1;
                yData = tmp2;
            }

            for(i = 0; i < xData.length; i++){
                data.push([xData[i], yData[i]]);
            }
            title = x + " ~ " + y;
            series[0] =  {
                type: 'scatter',
                name: x + ' ~ ' + y,
                color: plotColors[0],
                data: data
            };
        }else{
            title = x + " ~ " + y + " grouped by " + factor;
            factors = currentData.data[factor];
            factors = factors.unique();
            for(i = 0; i < factors.length; i ++){
                indexes = getAllIndexes(currentData.data[factor], factors[i]);
                tmp = [];
                for(j = 0; j < indexes.length; j++){
                    if(checked && currentSubset.length != 0){
                        if(currentSubset.indexOf(indexes[j]) != -1){
                            tmp.push([xData[indexes[j]], yData[indexes[j]]]);
                        }
                    }else{
                        tmp.push([xData[indexes[j]], yData[indexes[j]]]);
                    }
                }
                series[i] = {
                    name: 'test',
					//getArrayOfIDs(tmp),
					//currentData.data[factor][indexes[0]],
					//getPointInfo(dataInfoIndex, i)
                    color: plotColors[i],
                    data: tmp
                }
            }
        }
        createDoubleDataInfo(x, y, checked);
    }

    plotScatterPlot(title, xAxisTitle, yAxisTitle, series);
    hideElement('#plotDialog');
    $('.backgroundDiv').hide();
    createPlotContainer();
};

/*
getPointInfo = function(dataInfoIndex, index){
    return dataInfo[dataInfoIndex][index];
};

getArrayOfIDs = function(data){
	for(i = 1; i <= data.length; i ++){
		interation.push([i]);
	}
	return interation;
}
*/

addExtractionAndMethodToInfo = function(tmpInfo, nameIndex){
    if(currentData.gemasInfo.EXTRACTION != null && currentData.gemasInfo.EXTRACTION != undefined){
        tmpInfo += 'Extraction: ' + currentData.gemasInfo.EXTRACTION[nameIndex] + '<br>';
    }
    if(currentData.gemasInfo.METHOD != null && currentData.gemasInfo.METHOD != undefined){
        tmpInfo += 'Method: ' + currentData.gemasInfo.METHOD[nameIndex] + '<br>';
    }

    return tmpInfo;
};

createSingleDataInfo = function(x, useOnlySubset){
    var info = [];
    var length = currentData.data[x].length;
    var nameIndex = currentData.names.indexOf(x);
    for(var i = 0; i < length; i++){
        var tmpInfo = '<b>' + x + '</b> <br>';
        if(useOnlySubset && currentSubset.length > 0){
            if(currentSubset.indexOf(i) != -1){
                tmpInfo += 'ID: ' + i + '<br>';
                tmpInfo = addExtractionAndMethodToInfo(tmpInfo, nameIndex);
                info.push(tmpInfo);
            }
        }else{
            tmpInfo += 'ID: ' + i + '<br>';
            tmpInfo = addExtractionAndMethodToInfo(tmpInfo, nameIndex);
            info.push(tmpInfo);
        }
    }
    dataInfo.push(info);
};

createDoubleDataInfo = function(x, y, useOnlySubset){
    var info = [];
    var length = currentData.data[x].length;
    var nameIndexX = currentData.names.indexOf(x);
    var nameIndexY = currentData.names.indexOf(y);

    for(var i = 0; i < length; i++){
        var tmpInfo = 'ID: ' + i + '<br> ';
        var tmpInfoX = '<b>' + x + '</b> <br>';
        var tmpInfoY = '<b>' + y + '</b> <br>';
        if(useOnlySubset && currentSubset.length > 0){
            if(currentSubset.indexOf(i) != -1){
                tmpInfoX = addExtractionAndMethodToInfo(tmpInfoX, nameIndexX);
                tmpInfoY = addExtractionAndMethodToInfo(tmpInfoY, nameIndexY);
                tmpInfo += tmpInfoX + tmpInfoY;
                info.push(tmpInfo);
            }
        }else{
            tmpInfoX = addExtractionAndMethodToInfo(tmpInfoX, nameIndexX);
            tmpInfoY = addExtractionAndMethodToInfo(tmpInfoY, nameIndexY);
            tmpInfo += tmpInfoX + tmpInfoY;
            info.push(tmpInfo);
        }
    }
    dataInfo.push(info);
};

plotScatterPlot = function(title, xAxisTitle, yAxisTitle, series){
    showElement('#' + nrPlotId);
    var dataInfoIndex = nrPlotId;
    selectedPoints.push([]);
    $('#plotContainer' + nrPlotId).highcharts({
        chart: {
            type: 'scatter',
            zoomType: 'xy'
        },
        title: {
            text: title
        },
        xAxis: {
            title: {
                text: xAxisTitle
            },
            showLastLabel: true
        },
        yAxis: {
            title: {
                text: yAxisTitle
            }
        },
        legend: {
            layout: 'vertical',
            align: 'left',
            verticalAlign: 'top',
            x: 50,
            y: 5,
            floating: true,
            backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF',
            borderWidth: 1
        },
        plotOptions: {
            series: {
                allowPointSelect: true,
                point: {
                    events: {
                        select: function () {
                            addSelectedPoint(dataInfoIndex,this.series.data.indexOf( this ))
                        },
                        unselect: function(){
                            removeUnselectedPoint(dataInfoIndex, this.series.data.indexOf( this ));
                        }
                    }
                }
            },
            scatter: {
                marker: {
                    radius: 5,
                    states: {
                        hover: {
                            enabled: true,
                            lineColor: 'rgb(100,100,100)'
                        }
                    }
                },
                states: {
                    hover: {
                        marker: {
                            enabled: false
                        }
                    }
                }
            }
        },
        series: series
    });
};

/********************************************************************************
 ************************************ BOXPLOT ***********************************
 *******************************************************************************/
createBoxPlotParameters = function(){
    var container = document.getElementById('plotTypeParameterContainer');
    var yAxis = createDiv('variablesType', 'yAxisDiv', 'y - axis');
    var yTextField = createTextField('plotDialogElement', 'plotParametersYTextField', '');

    var varSelector = createSelect('plotDialogElement', 'plotParametersXSelector');
    varSelector.appendChild(createOption('', 'factor', 'Factor'));
    varSelector.appendChild(createOption('', 'variables', 'Variables'));
    container.appendChild(varSelector);
    container.appendChild(createDiv('', 'columnPlotParametersXPar', ''));
    varSelector.setAttribute('onchange', 'createBoxPlotParametersXPar(this.selectedOptions[0].value)');
    container.appendChild(yAxis);
    yTextField.setAttribute('placeholder', 'Enter reference variable! eg: ' + currentData.names[Math.ceil(currentData.names.length/2)]);
    container.appendChild(yTextField);
    var methodFiled = createTextField('plotDialogElement', 'boxPlotMethodField', '');
    methodFiled.setAttribute('placeholder', 'optional! eg: log, sqrt ...');
    container.appendChild(createBr());
    container.appendChild(methodFiled);
    createBoxPlotParametersXPar('factor');
    okButton.setAttribute('onclick', 'getBoxPlotOptions()');


};

createBoxPlotParametersXPar = function(type){
    cleanModalDialog('columnPlotParametersXPar');
    var container = document.getElementById('columnPlotParametersXPar');
    var xParametersSelector = createSelect('plotDialogElement', 'variablesBarPlotSelector');
    container.appendChild(xParametersSelector);
    if(type == 'variables'){
        $('#plotParametersYTextField').hide();
        $('#yAxisDiv').hide();
        $('#boxPlotMethodField').hide();
        var children = document.getElementById('variableGroupSelector').children;
        for(var i = 1; i < children.length; i++){
            xParametersSelector.appendChild(createOption(children[i].className, children[i].value, children[i].innerHTML));
            if(children[i].innerHTML == currentVariablesGroupName){
                xParametersSelector.selectedIndex = (i - 1);
            }
        }
    }else{
        $('#plotParametersYTextField').show();
        $('#yAxisDiv').show();
        $('#boxPlotMethodField').show();
        for(i = 0; i < currentData.variablesTypes.length; i++){
            if(currentData.variablesTypes[i] == 'factor'){
                xParametersSelector.appendChild(createOption('', currentData.names[i], currentData.names[i]));
            }
        }
    }
};

getBoxPlotOptions = function(){
    var type = document.getElementById('plotParametersXSelector').value;
    var option = document.getElementById('variablesBarPlotSelector').selectedOptions[0];
    var checked = document.getElementById('plotSubsetDataCheckBox').checked;

    var options = {};
    if(type == 'factor'){
        if(option != undefined && option != null){
            if(option.value == ""){
                popUpMessage('ERROR: chosen data doesn\'t contain any factors!');
                return;
            }
            options['factor'] = option.value;
            var variable = document.getElementById('plotParametersYTextField').value;
            if(variable == ""){
                popUpMessage('ERROR: empty variable-field!');
                return;
            }else{
                if(!doesGivenVariableExist(variable)){
                    popUpMessage('ERROR: variable "' + variable +'" doesn\'t exist on current dataset');
                }
            }
            options["variable"] = variable;
            var method = document.getElementById('boxPlotMethodField').value;
            options["method"] = method;
            if(method != ""){
                options['title'] = method + '(' + variable + ') in ' + option.value;
            }else{
                options['title'] = variable + ' in ' + option.value;
            }
        }else{
            popUpMessage('ERROR: chosen data doesn\'t contain any factors!');
            return;
        }
    }else{
        options['variablesName'] = option.value;
        options['variablesType'] = option.className;
        options['title'] = "comp1 - boxplot";
    }

    options["useSubset"] = checked;
    options["currentSubset"] = currentSubset;

    if(type == 'factor'){
        Shiny.onInputChange('boxPlotFactor', options);
    }else{
        Shiny.onInputChange('boxPlotVariables', options);
    }

};

createBoxPlotSeries = function(data){
    var dataToPlot = [];
    var outliers = [];
    for(var i = 0; i < data.categories.length; i++){
        dataToPlot.push(data.results[data.categories[i]]);

        var tmpOut = data.lowerOutliers[data.categories[i]];
        if(tmpOut[0] != "no"){
            for(var j = 0; j < tmpOut.length; j++){
                outliers.push([i, tmpOut[j]]);
            }
        }

        tmpOut = data.upperOutliers[data.categories[i]];
        if(tmpOut[0] != "no"){
            for(j = 0; j < tmpOut.length; j++){
                outliers.push([i, tmpOut[j]]);
            }
        }
    }

    if(data.categories.length > 10){
        $('#completeContainer' + nrPlotId).width(1280);
        $('#plotContainer' + nrPlotId).width(1200);
    }

    plotBoxPlot(data.title, data.categories, dataToPlot, outliers);
    hideElement('#plotDialog');
    $('.backgroundDiv').hide();
    createPlotContainer();

};

plotBoxPlot = function(title, categories, data, outliers){
    showElement('#' + nrPlotId);
    dataInfo.push([]);
    selectedPoints.push([]);
    $('#plotContainer' + nrPlotId).highcharts({

        chart: {
            type: 'boxplot',
            zoomType: 'xy'
        },

        title: {
            text: title
        },

        legend: {
            enabled: false
        },

        xAxis: {
            categories: categories
        },

        yAxis: {
            title: {
                text: 'Observations'
            }
        },

        series: [{
            name: 'Observations',
            data: data
        }, {
            name: 'Outlier',
            color: Highcharts.getOptions().colors[0],
            type: 'scatter',
            data: outliers,
            marker: {
                fillColor: 'white',
                lineWidth: 1,
                lineColor: Highcharts.getOptions().colors[0]
            },
            tooltip: {
                pointFormat: 'Observation: {point.y}'
            }
        }]

    });
};
