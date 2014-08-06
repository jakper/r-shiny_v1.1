library(shiny)
library(shinyAce)
library(shinyRGL)
library(rHighcharts)
library(rCharts)

shinyUI(navbarPage("i-CoDa",
    tabPanel("StartPage",
        HTML('
            <h1> i-CoDa</h1>
            <br>
            <h5>
                Welcome to <span class="capital">i</span>(nteractive) <span class="capital"> - Co</span>(mpositional) <span class="capital"> Da</span>(ta), an UI for compositioal data analysis.
            </h5>
        ')
    ),
    navbarMenu("Data",
    tabPanel("See Data",
    HTML(
        ' <div class="selectorDiv">Select Data </br> <select id="dataSelector" class="btn" onchange="selectedDataSet(value)"></select></div>
        <div class="selectorDiv">Select Variable Group </br> <select id="variableGroupSelector" class="btn" onchange="selectedVariableGroup(selectedOptions)"></select></div>
        <div class="selectorDiv">Select Subset </br> <select id="subsetSelector" class="btn" onchange="selectedSubset(selectedOptions)"></select></div> <br><br><br><br>
        <button type="button" class="btn tableinput-settings" id="settings" style="margin-bottom:15px; width:70px;">
            <i class="icon-cog"></i>
        </button>
        <table id="dataTable" class="table table-bordered table-condensed" style="text-align:center;"></table>'
    )),
    tabPanel("Import Data",
        wellPanel(
            fileInput("uploadCSVFile", "Choose CSV File",
                accept = c("text/csv", "text/comma-separated-values,text/plain", ".csv")
             ),

             fileInput("uploadRData", "Choose RData File",
                accept = c("text/RData", "text/plain", ".RData")
             )
        ),

        HTML(
            '<div class="well">
            <input type="button" class="btn" id="import from R" value="Import from R" onclick="importDataFromR()"/>
            </div>'
        )),
        tabPanel("Export Data",
            wellPanel(
                HTML('
                    <button type="button" class="btn" id="saveCSV" style="margin-bottom:15px; width:150px">Save .CSV</button>
                    <br>
                    <button type="button" class="btn" id="saveRData" style="margin-bottom:15px; width:150px">Save .RData</button>

                ')
            )
        )),
    navbarMenu('Data Manipulation',
    tabPanel('Missing Values',
        HTML('<div class = "well workingWell", id = "missingValuesWell"></div>
            <div class = "well workingWell", id = "nasWell"></div>
        ')
    ),
    tabPanel('Detection Limit',
         HTML('<div class = "well workingWell", id = "detectionLimitWell"></div>
               <div class = "well workingWell", id = "infoWell", style = "display:none"></div>
         ')
    ),
    tabPanel('Transformation',
        HTML('<div id = "transformationsDiv">
            <div class = "well", id = "transformationsWell", style = "float:left"></div>
             <div class = "well", id = "transformationVariablesDiv",  style="float:left; margin-left:15px; display:none; width: 280px;"></div>
             </div>'
        )
    ),
    tabPanel('Define Variables Group',
        HTML('
            <div class = "well workingWell", id = "defineVariablesGroupWell"></div>
        ')
    ),
    tabPanel('Define Observations Group',
        HTML('
            <div class = "well workingWell", id = "defineObservationsGroupWell"></div>
        ')
    )),
    navbarMenu('Statistical Methods',
        tabPanel('Principal Component Analysis',
            HTML('
                <div class="well workingWell", id="pcaWell"></div>
            ')
        ),
        tabPanel('Factor Analysis',
            HTML('
                <div class="well workingWell" id="faWell"></div>
            ')
        ),
        tabPanel('Discriminant Analysis',
            HTML('
                <div class="well workingWell", id="daWell"></div>
            ')
        ),
        tabPanel('Cluster',
            HTML('
                <div class="well workingWell" id="clustWell"></div>
            ')
        ),
        tabPanel('Regression',
            HTML('
                <div class="well workingWell" id="regressionWell"></div>
            ')
        ),
        tabPanel('Outlier Detection',
            HTML('
                <div class="well workingWell" id="outlierWell"></div>
            ')
        )
    ),
    navbarMenu('Tests'
    ),
    tabPanel("Plot",
         HTML('
            <div class="completeContainer" id="completeContainer1">
                <div class="well plotContainer" id = "plotContainer1">
                    <img id="plus" src="plus.png" onclick="createPlotDialog()"/>
                </div>
                <div class="minus" id = "1"  onclick="deletePlot(this.id)">
                    <i class="icon-minus-sign" display="none"></i>
                </div>
            </div>
         ')
    ),

    # importing the needed script and css files
          tags$head(
              tags$link(rel="stylesheet", type="text/css",href="style.css"),
              tags$script(type = "text/javascript", src = "app.js"),
              tags$script(type = "text/javascript", src = "busy.js"),
              tags$script(type = "text/javascript", src = "Highcharts-4.0.3/js/highcharts.js"),
              tags$script(type = "text/javascript", src = "Highcharts-4.0.3/js/highcharts-3d.js"),
              tags$script(type = "text/javascript", src = "Highcharts-4.0.3/js/highcharts-more.js"),
              tags$script(type = "text/javascript", src = "Highcharts-4.0.3/js/modules/exporting.js")
              )
))
