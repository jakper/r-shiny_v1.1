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
dataList <- list()
makeReactiveBinding("dataList")

currentData <- data.frame()
makeReactiveBinding("currentData")

tempData <- NULL
makeReactiveBinding("tempData")

shinyServer(function(input, output, session) {

    session$sendCustomMessage(type = 'allRPackages', message = sort(installed.packages()[,1]))

     output$dataSelector <- renderUI({
          names <- names(dataList)

          selectInput("dataSelectorChosenData",
                       "Select Data",
                        names)
       })


  observe({
      file <- input$uploadFile

      if(!is.null(file)){
         tempData <<- read.csv(file$datapath)

        if(!is.null(isolate(tempData))){
            session$sendCustomMessage(type = "createSingleCheckboxDialog", message = isolate(names(tempData)))
        }
      }
  })

    observe({
        input$dataSelectorChosenData
        if(!is.null(input$dataSelectorChosenData)){
            if(input$dataSelectorChosenData != ""){
                currentData <<- eval(parse(text = paste0("dataList$", input$dataSelectorChosenData)))
                session$sendCustomMessage(type = 'createTable', message = currentData)
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
        if(!is.null(input$chosenData)){
            eval(parse(text = paste0("data(", input$chosenData, ")")))
            tempData <<- eval(parse(text = input$chosenData))
            if(!is.null(isolate(tempData))){
                session$sendCustomMessage(type = 'createSingleCheckboxDialog', message = names(isolate(tempData)))
            }
        }else{
            return()
        }
    })

    observe({
       if(!is.null(input$chosenVariables)){
             isolate(eval(parse(text = paste0("tempData <<- tempData[-input$chosenVariables]"))))
             session$sendCustomMessage(type = 'createInputNameDialog', message = '  ')
       }
       else{
            return()
       }
    })


    observe({
      if(!is.null(input$chosenName)){
           isolate(eval(parse(text = paste0("dataList$", input$chosenName, "<<-", "tempData"))))
           session$sendCustomMessage(type = 'allData', message = isolate(dataList))
           #session$sendCustomMessage(type = 'allDataNames', message = names(isolate(dataList)))
           session$sendCustomMessage(type = 'popUpMessage', message = 'Chosen data was succesfully imported')
      }
    })
})
