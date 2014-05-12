library(shiny)
library(shinyRGL)
library(mvoutlier)
library(robCompositions)
data(moss)
data(humus)
library(ggplot2)
library(shinyAce)
library(rgl)
library(rCharts)
library(rHighcharts)
library(shinyIncubator)

# creating the list with that contains the data
variablesEnv <- new.env()
setClass("compData", representation(coordVar = "numeric", internVar = "numeric", externVar = "numeric",
        compVar = "numeric"), contains = "data.frame")

assign("dataList", list(), env = variablesEnv)
assign("currentData", data.frame(), env = variablesEnv)
assign("tempData", data.frame(), env = variablesEnv)
assign("uploadPath", NULL, env = variablesEnv)
assign("name", NULL, env = variablesEnv)

shinyServer(function(input, output, session) {

    session$sendCustomMessage(type = 'allRPackages', message = sort(installed.packages()[,1]))

     output$dataSelector <- renderUI({
          names <- names(variablesEnv$dataList)

          selectInput("dataSelectorChosenData",
                       "Select Data",
                        names)
       })


  observe({
      file <- input$uploadFile
      if(!is.null(file)){
        variablesEnv$uploadPath <- file$datapath
        variablesEnv$tempData <- read.csv(file$datapath)
        if(!is.null(variablesEnv$tempData)){
            session$sendCustomMessage(type = "createCSVFileOptionDialog", message = file$name)
        }
      }
  })

  observe({
    if(!is.null(input$preview)){
        options <- input$preview
        if(!is.null(variablesEnv$uploadPath)){
            variablesEnv$tempData <- read.table(variablesEnv$uploadPath, header = options$header,
                sep = options$separator, dec = options$decimal,
                quote = options$quotes)
        }

            variablesEnv$tempData[variablesEnv$tempData < options$detectionLimit] <- options$valueUnderDetectionLimit

            session$sendCustomMessage(type = 'createPreviewTable', message = variablesEnv$tempData)
        }
  })

  observe({
    if(!is.null(input$uploadChosenFile)){
        options <- input$uploadChosenFile
        if(!is.null(variablesEnv$uploadPath)){
                    variablesEnv$tempData <- read.table(variablesEnv$uploadPath, header = options$header,
                        sep = options$separator, dec = options$decimal,
                        quote = options$quotes)
        }

        variablesEnv$tempData[variablesEnv$tempData < options$detectionLimit] <- options$valueUnderDetectionLimit
        variablesEnv$name <- options$name
        session$sendCustomMessage(type = 'createChooseVariableDialog', message = names(variablesEnv$tempData))
     }
  })

  observe({
    if(!is.null(input$chosenVariables)){
        chosenVariables <- input$chosenVariables

        if(is.null(unlist(chosenVariables$compVar))){
            chosenVariables$compVar <- -1
        }

        if(is.null(unlist(chosenVariables$coordVar))){
              chosenVariables$coordVar <- -1
        }

        if(is.null(unlist(chosenVariables$internVar))){
               chosenVariables$internVar <- -1
        }

        if(is.null(unlist(chosenVariables$externVar))){
               chosenVariables$externVar <- -1
        }

        variablesEnv$tempData <- variablesEnv$tempData[-unlist(chosenVariables$unchecked)]
        data <- new("compData", variablesEnv$tempData,
                    coordVar = unlist(chosenVariables$coordVar),
                    internVar = unlist(chosenVariables$internVar),
                    externVar = unlist(chosenVariables$externVar),
                    compVar = unlist(chosenVariables$compVar))
        eval(parse(text = paste0("variablesEnv$dataList$",variablesEnv$name ,"<- data")))
        variablesEnv$uploadPath <- NULL
        str(variablesEnv$dataList)
        session$sendCustomMessage(type = 'popUpMessage', message = 'Chosen data was succesfully upladed!')
    }
  })


    observe({
        input$dataSelectorChosenData
        if(!is.null(input$dataSelectorChosenData)){
            if(input$dataSelectorChosenData != ""){
                variablesEnv$currentData <- variablesEnv$dataList[as.character(input$dataSelectorChosenData)]
                session$sendCustomMessage(type = 'createTable', message = variablesEnv$currentData)
            }
        }
    })

    #chosen package
    observe({
        input$chosenPackage
        if(!is.null(input$chosenPackage)){
            eval(parse(text = paste0("library(", input$chosenPackage, ")")))
            eval(parse(text = paste0('availableDataInThePackage <- data(package = "', input$chosenPackage, '")$results[,3]')))
            if(length(availableDataInThePackage) == 0){
                session$sendCustomMessage(type = 'popUpMessage', message = 'Chosen package contains no data!')
            }
            else{
                session$sendCustomMessage(type = 'availableDataInThePackage', message = availableDataInThePackage)
            }
        }
    })

    #chosen data from package
    observe({
        variablesEnv$name <- input$chosenData
        if(!is.null(variablesEnv$name)){
            eval(parse(text = paste0("data(", variablesEnv$name, ")")))
            variablesEnv$tempData <- eval(parse(text = variablesEnv$name))
            if(!is.null(variablesEnv$tempData)){
                variablesEnv$uploadPath <- NULL
                session$sendCustomMessage(type = 'createFileOptionDialog', message = variablesEnv$name)
            }
        }
    })

})
