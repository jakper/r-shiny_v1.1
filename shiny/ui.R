library(shiny)
library(shinyAce)
library(shinyRGL)
library(rHighcharts)
library(rCharts)

shinyUI(navbarPage("Shiny",
    tabPanel("StartPage"),
    navbarMenu("Data",
    tabPanel("See Data",
    uiOutput('dataSelector'),
    HTML(
        '<button type="button" class="btn tableinput-settings" id="settings" style="margin-bottom:15px;">
            <i class="icon-cog"></i>
        </button>
        <button type="button" class="btn tableinput-settings" id="edit" style="margin-bottom:15px">Edit</button>
        <table id="dataTable" class="table table-bordered table-condensed"></table>'
    )),
    tabPanel("Import Data",
        wellPanel(
            fileInput("uploadFile", "Choose CSV File",
                accept=c("text/csv", "text/comma-separated-values,text/plain", ".csv")
             )
        ),

        HTML(
            '<div class="well">
            <input type="button" class="btn" id="import from R" value="Import from R" onclick="importDataFromR()"/>
            </div>'
        ))),
    tabPanel("Plot",
         HTML(
                '<select onclick="plotSelectedNumber(value)">
                    <option value = "1">1</option>
                    <option value = "2">2</option>
                    <option value = "4">4</option>
                    <option value = "6">6</option>
                    <option value = "9">9</option>
                    <option value = "12">12</option>
                </select>
                <label id="plotLabel">
                </label>')
    ),
    tabPanel("Regression"),

    # importing the needed script and css files
          tags$head(
              tags$link(rel="stylesheet", type="text/css",href="style.css"),
              tags$script(type = "text/javascript", src = "busy.js"),
              tags$script(type = "text/javascript", src = "app.js"))
))
