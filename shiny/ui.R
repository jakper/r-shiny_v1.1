tryCatch({library(shiny)}, error = function(cond){return(NULL)})
library(ggplot2)
#require(rCharts)

shinyUI(navbarPage("i-CoDa",
    tabPanel("StartPage",
        HTML('
            <h1> i-CoDa</h1>
            <br/>
            <h5>
                Welcome to <span class="capital">i</span>(nteractive) <span class="capital"> - Co</span>(mpositional) <span class="capital"> Da</span>(ta),
                 an userfriendly inerface for compositioal data analysis. <it>i-Coda</it> is the result of combining <i>R</i> with <i>JavaScript, JQuery, HTML and
                 CSS.</i>
                 <br/>
                 In order the use all features, that are provided by <i>i-Coda</i>, you need to have installed the following R-libraries:
                 <i>
                 <ul>
                    <li>shiny</li>
                    <li>mvoutlier</li>
                    <li>robCompositions</li>
                    <li>VIM</li>
                    <li>StatDA</li>
                    <li>robustbase</li>
                    <li>MASS</li>
                    <li>mclust</li>
                 </ul>
                 </i>
                 <br/>
                 <br/>
                 <u><b>Features</b><br/><br/>
                 <b>I Data</b> <br/>
                 I.1 Data Import <br/></u>
                 The first feature you would use, is "data import". <i>i-CoDa</i> gives you the possibility to import files (.csv and .RData),
                 but also you can import a data set, directly from an installed R-package. <br>
                 <u>I.1.1 CSV-File</u> <br/>
                 When importign csv-files, you can either import a
                 standard file or you can import an extended  csv-file. <br/><br/> <b>Example:</b><br/>
                <img class="screenshots" src="screenshots/1.png"/> <br/> As we can see, this csv-file has an extra column, that contains information about the data. For example
                the data inserted on the row with <i>"LDL"</i> will be used for imputation.
                <br/><br/>
                After choosing the desired file, you will see following screen: <br/>
                <img class="screenshots" src="screenshots/2.png"/>
                <br/><br/>
                This is where you can define the upload-options. The <i>preview</i>-button shows you, how your data will be imported with
                the current options. <br>
                <img class="screenshots" src="screenshots/3.png" /> <br/><br/>

                <u>I.1.2 RData-File</u> <br>
                When importing a <i>RData</i>-file, there is not much to do. After choosing the file, that will be uploaded, you only have to
                choose the name, under which the file will be imported. <br/>
                <img class="screenshots" src="screenshots/4.png" /> <br/><br/>

                <u>I.1.3 R-Packages</u><br>
                When importing a data-set from a r-package, the first thing to do, you is choosing the desired package. <br>
                <img class="screenshots" src="screenshots/5.png" /> <br/><br/>
                Next step is, choosing the data-set from the chosen package. (in the example I chosed package "car") <br>
                <img class="screenshots" src="screenshots/5.png" /> <br/><br/>
                And than, you must chose a name for the data set or use the default one. (just like in importing RData-Files)
                <br/><br/>
                The file step of importing a data set, is the same for all kind of imports. When reaching the final step, you will see a dialog similar to this one: <br/>
                <img class="screenshots" src="screenshots/7.png" /> <br/><br/>
                <br/>
                On the first column you will se the names of all variables available in the chosen data, while on the second column you will see their type.
                There are 4 possible types to use:
                <ul>
                    <li>character</li>
                    <li>numeric</li>
                    <li>factor</li>
                    <li>logical</li>
                </ul>


            </h5>
        ')
    ),
    navbarMenu("Data",
    tabPanel("Inspect Data",
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
        ))
#        tabPanel("Export Data",
#            wellPanel(
#                HTML('
#                    <button type="button" class="btn" id="saveCSV" style="margin-bottom:15px; width:150px">Save .CSV</button>
#                    <br>
#                    <button type="button" class="btn" id="saveRData" style="margin-bottom:15px; width:150px">Save .RData</button>
#
#                ')
#            )
#        )
        ),
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
				
            '),
            fluidRow(
              column(width = 6,
                plotOutput("pca.BiPlot",width = "400px", height = "400px",
                           click = "pca.Plot_click",
                           brush = brushOpts(
                             id = "pca.Plot_brush"
                           ))),
              column(width = 6,
                plotOutput("pca.BiPlotNoInteraction",width = "400px", height = "400px"
                           ))
            ),
            downloadButton('pcaDownloadScors', 'Download Scors'),
            downloadButton('pcaDownloadLoadings', 'Download Loadings'),
            downloadButton('pcaDownloadFilteredData', 'Download filtered Data'),
            
            fluidRow(
              column(width = 12, h4("Points near click"),
                     dataTableOutput("pca.click_info")
              ),
              column(width = 12, h4("Brushed points"),
                     dataTableOutput("pca.brush_info")
              )
            ),
            plotOutput("pca.ScreePlot",height = "400px"),
            HTML('
                <pre id="pca.Summary" class = "shiny-text-output"></pre>
                 '),
            h4("Loadings"),
            dataTableOutput("pca.Loadings")
        ),
        
        
        tabPanel('Factor Analysis',
            HTML('
                <div class="well workingWell" id="pfaWell"></div>
            '),
            
            
            fluidRow(
              column(width = 6,
                     plotOutput("pfa.BiPlot",width = "400px", height = "400px",
                                click = "pfa.Plot_click",
                                brush = brushOpts(
                                  id = "pfa.Plot_brush"
                                ))),
              column(width = 6,
                     plotOutput("pfa.BiPlotNoInteraction",width = "400px", height = "400px"
                     ))
            ),
            downloadButton('downloadScors', 'Download Scors'),
            downloadButton('pfaDownloadLoadings', 'Download Loadings'),
            downloadButton('downloadFilteredData', 'Download filtered Data'),
            fluidRow(
              column(width = 12, h4("Points near click"),
                     #verbatimTextOutput("click_info")
                     dataTableOutput("pfa.click_info")
              ),
              column(width = 12, h4("Brushed points"),
                     #verbatimTextOutput("brush_info")
                     dataTableOutput("pfa.brush_info")
              )
            ),
            plotOutput("pfa.Loadplot"),
            HTML('
                <pre id="pfa.Loadings" class = "shiny-text-output"></pre>
                 ')
        ),
        
        
        tabPanel('Discriminant Analysis',
            HTML('
                <div class="well workingWell", id="daWell"></div>
            '),
            
            plotOutput("da.Plot", width = "400px", height = "400px",
                         # Equivalent to: click = clickOpts(id = "plot_click")
                         click = "da.Plot_click",
                         brush = brushOpts(
                           id = "da.Plot_brush"
                         )),

            downloadButton('daDownloadScors', 'Download Scors'),
            downloadButton('daDownloadLoadings', 'Download Loadings'),
            downloadButton('daDownloadPredict', 'Download predicted Data'),
            fluidRow(
              column(width = 12, h4("Points near click"),
                     #verbatimTextOutput("click_info")
                     dataTableOutput("da.click_info")
              ),
              column(width = 12, h4("Brushed points"),
                     #verbatimTextOutput("brush_info")
                     dataTableOutput("da.brush_info")
              )
            ),
            HTML('
                <pre id="da.print" class = "shiny-text-output"></pre>
                
            ')
        ),
        
        
        tabPanel('Cluster',
            HTML('
                <div class="well workingWell" id="clustWell"></div>
            '),
            
            plotOutput("clust.Plot", width = "400px", height = "400px",
                       # Equivalent to: click = clickOpts(id = "plot_click")
                       click = "clust.Plot_click",
                       brush = brushOpts(
                         id = "clust.Plot_brush"
                       )),
            #HTML('
            #    <div id="clustChooseCluster"></div>
            #'),
            #downloadButton('clustDownloadCluster', 'Download Cluster'),
            downloadButton('clustDownloadFilteredData', 'Download filtered Data'),
            fluidRow(
              column(width = 12, h4("Points near click"),
                     #verbatimTextOutput("click_info")
                     dataTableOutput("clust.click_info")
              ),
              column(width = 12, h4("Brushed points"),
                     #verbatimTextOutput("brush_info")
                     dataTableOutput("clust.brush_info")
              )
              ),
            plotOutput("clust.Dendrogram"),
            plotOutput("clust.BicPlot", width = "400px", height = "400px"),
            HTML('
                <pre id="clust.OptimalCluster" class = "shiny-text-output"></pre>
                <pre id="clust.ClusterVector" class = "shiny-text-output"></pre>
            ')
        ),
        
        
        tabPanel('Regression',
            HTML('
                <div class="well workingWell" id="regressionWell"></div>
            '), 
            plotOutput("regression.Plot", width = "400px", height = "400px",
                       # Equivalent to: click = clickOpts(id = "plot_click")
                       click = "regression.Plot_click",
                       brush = brushOpts(
                         id = "regression.Plot_brush"
                       )),
            downloadButton('regressionDownloadFittedValues', 'Download Fitted Values'),
            downloadButton('regressionDownloadResiduals', 'Download Residuals'),
          fluidRow(
             column(width = 12,
                    h4("Points near click"),
                    #verbatimTextOutput("click_info")
                    dataTableOutput("click_info")
             ),
             column(width = 12,
                    h4("Brushed points"),
                    #verbatimTextOutput("brush_info")
                    dataTableOutput("brush_info")
             )
           ),
           HTML('
                <pre id="render.tes" class = "shiny-text-output"></pre>
                
            '),
          plotOutput("regression.diagnostic1"),
          plotOutput("regression.diagnostic2"),
          plotOutput("regression.diagnostic3"),
          plotOutput("regression.diagnostic4"),
          plotOutput("regression.diagnostic5")
            
        ),
        
        
        tabPanel('Outlier Detection',
            HTML('
                <div class="well workingWell" id="outlierWell"></div>
                <pre id="od.summary" class = "shiny-text-output"></pre>
            '),
            plotOutput("od.DDPlot",width = "400px", height = "400px")
        )
    ),
#    navbarMenu('Tests'
#    ),
    tabPanel("Plot",
         HTML('
            <div class="completeContainer" id="completeContainer0">
                <div class="well plotContainer" id = "plotContainer0">
                    <img id="plus" src="plus.png" onclick="createPlotDialog()"/>
                </div>
                <div class="minus" id = "0"  onclick="deletePlot(this.id)">
                    <i class="icon-minus-sign" display="none"></i>
                </div>
                <div class="plus" id = "plus0" onclick="createSubsetNameFieldFromPoints(0)">
                    <i class="icon-plus-sign" display="none"></i>
                </div>
            </div>
         ')
    ),

    # importing the needed script and css files
          tags$head(
              tags$link(rel="stylesheet", type="text/css",href="style.css"),
              tags$link(rel="icon", type="image/x-icon", href="icon.ico"),
              tags$script(type = "text/javascript", src = "app.js"),
              tags$script(type = "text/javascript", src = "busy.js"),
              tags$script(type = "text/javascript", src = "Highcharts-4.0.3/js/highcharts.js"),
              tags$script(type = "text/javascript", src = "Highcharts-4.0.3/js/highcharts-3d.js"),
              tags$script(type = "text/javascript", src = "Highcharts-4.0.3/js/highcharts-more.js"),
              tags$script(type = "text/javascript", src = "Highcharts-4.0.3/js/modules/exporting.js")
              )
))
