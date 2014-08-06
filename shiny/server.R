tryCatch({library(shiny)}, error = function(cond){return(NULL)})
tryCatch({library(shinyRGL)}, error = function(cond){return(NULL)})
tryCatch({library(mvoutlier)}, error = function(cond){return(NULL)})
tryCatch({library(robCompositions)}, error = function(cond){return(NULL)})
tryCatch({library(VIN)}, error = function(cond){return(NULL)})
tryCatch({library(StatDA)}, error = function(cond){return(NULL)})
tryCatch({library(robustbase)}, error = function(cond){return(NULL)})
tryCatch({library(MASS)}, error = function(cond){return(NULL)})
tryCatch({library(ggplot2)}, error = function(cond){return(NULL)})
tryCatch({library(rgl)}, error = function(cond){return(NULL)})
tryCatch({library(mclust)}, error = function(cond){return(NULL)})

# class gemasInfo
setClass("gemasInfo", representation(header = 'character', comment = 'character', sample = 'character', id = 'vector', coords = 'character',
        variable = 'character', extraction = 'character', method = 'character', UDL = 'vector', LDL = 'vector', unit = 'character'), contains = NULL)

# creating the class compData and its methods
setClass("compData", representation(compositions = "list", externals = "list", coords = "list", ids = "list", transformations = "list", subsets = "list",
        variablesTypes = 'vector', availableGemasInfo = 'logical', gemasInfo = 'gemasInfo'), contains = "data.frame")

# createing a enviroment for saving temporary data
variablesEnv <- new.env()
assign("dataList", list(), env = variablesEnv)
assign("currentData", data.frame(), env = variablesEnv)
assign("currentVariableGroup", list(), env = variablesEnv)
assign("currentVariableGroupName", character, env = variablesEnv)
assign('currentSubset', list(), env = variablesEnv)
assign('currentSubsetName', list(), env = variablesEnv)
assign("tempData", data.frame(), env = variablesEnv)
assign("uploadPath", NULL, env = variablesEnv)
assign("name", NULL, env = variablesEnv)
assign("tempGemasInfo", 'gemasInfo', env = variablesEnv)
assign("availableGemasInfo", 'logical', env = variablesEnv)
assign("currentDataName", NULL, env = variablesEnv)

shinyServer(function(input, output, session) {

###############################################################################################################################################
################################################### VARIOUS FUNCTIONS #########################################################################
###############################################################################################################################################

    getNAs <- function(data){
        nas <- c()
        for(i in (1:length(names(data)))){
            nas[i] <- sum(is.na(data[i]))
        }

        return(nas)
    }

    createJSObject <- function(){
        temp <- variablesEnv$currentData
        variablesEnv$currentVariableGroup <- list()

        data <- list()
        data[["names"]] = names(variablesEnv$currentData)
        Data <- as.data.frame(temp@.Data)
        names(Data) <- names(variablesEnv$currentData)
        data[["data"]] = Data
        data[["compositions"]] = temp@compositions
        data[["externals"]] = temp@externals
        data[["coords"]] = temp@coords
        data[["ids"]] = temp@ids
        data[["transformations"]] = temp@transformations
        data[["subsets"]] = temp@subsets
        data[["variablesTypes"]] = temp@variablesTypes
        data[["nas"]] = getNAs(temp)
        data[["ldl"]] = getLDL(temp)
        data[["udl"]] = getUDL(temp)

        gemasInfo <- temp@gemasInfo
        test <- list()
        if(length(gemasInfo@header) > 0){
            test[["HEADER"]] <- gemasInfo@header
        }
        if(length(gemasInfo@comment) > 0){
            test[["COMMENT_DATASET"]] <- gemasInfo@comment
        }
        if(length(gemasInfo@id) > 0){
            test[["SAMPLE_IDENTIFIER"]] <- gemasInfo@id
        }
        if(length(gemasInfo@coords) > 0){
            test[["COORDINATES"]] <- gemasInfo@coords
        }
        if(length(gemasInfo@variable) > 0){
            test[["VARIABLE"]] <- gemasInfo@variable
        }
        if(length(gemasInfo@extraction) > 0){
            test[["EXTRACTION"]] <- gemasInfo@extraction
        }
        if(length(gemasInfo@method) > 0){
            test[["METHOD"]] <- gemasInfo@method
        }
        if(length(gemasInfo@UDL) > 0){
            test[["UDL"]] <- gemasInfo@UDL
        }
        if(length(gemasInfo@LDL) > 0){
            test[["LDL"]] <- gemasInfo@LDL
        }
        if(length(gemasInfo@unit) > 0){
            test[["UNIT"]] <- gemasInfo@unit
        }
        data[["gemasInfo"]] <- test
        return(data)
    }

    getLDL <- function(data){
        ldl <- c()
        limit <- data@gemasInfo
        limit <- limit@LDL
        if(length(limit) > 0){
            for(i in (1:length(names(data)))){
                if(is.na(limit[i])){
                    ldl[i] <- ""
                }
                else{
                    ldl[i] <- sum(data[i] < as.numeric(limit[i]))
                }
            }
        }

        return(ldl)
    }


    getUDL <- function(data){
        udl <- c()
        limit <- data@gemasInfo
        limit <- limit@UDL
        if(length(limit) > 0){
            for(i in (1:length(names(data)))){
                if(is.na(limit[i])){
                    udl[i]<- ""
                }
                else{
                    udl[i] <- sum(data[i] > as.numeric(limit[i]))
                }
            }
        }

        return(udl)
    }

    sendPopUpMessage <- function(textMessage){
        session$sendCustomMessage(type = 'popUpMessage', message = textMessage)
    }

    createDataSelector <- function(names){
        session$sendCustomMessage(type = 'createDataSelector', message = names)
    }

    renderDataInformation <- function(data){
        session$sendCustomMessage(type = 'renderDataInformation', message = data)
    }

    resetConnector <- function(connectorName){
        session$sendCustomMessage(type = 'resetConnector', message = connectorName)
    }

    setDataAndGroup <- function(fileName, groupName, subsetName){
            names = c();
            names[["fileName"]] = fileName
            names[["groupName"]] = groupName
            names[["subsetName"]] = subsetName
            session$sendCustomMessage(type = 'setSelectorsValue', message = names)
    }

    addNewDataToDataList <- function(newName, newData){
        eval(parse(text = paste0("variablesEnv$dataList$", variablesEnv$currentDataName ,"<- variablesEnv$currentData")))
        eval(parse(text = paste0("variablesEnv$dataList$",newName ,"<-", as.data.frame(newData))))
        createDataSelector(as.list(names(variablesEnv$dataList)))
        variablesEnv$currentDataName <- newName
        variablesEnv$currentData <- newData
    }

    getAllIdAndCoordIndexes <- function(){
        indexes <- c()
        data <- variablesEnv$currentData
        ids <- data@ids
        coords <- data@coords
        if(length(ids) > 0){
            names <- names(ids)
            for(i in 1:length(names)){
                eval(parse(text = paste0('indexes <- c(indexes,ids$',names[i], ')')))
            }
        }

        if(length(coords) > 0){
            names <- names(coords)
            for(i in 1:length(names)){
                eval(parse(text = paste0('indexes <- c(indexes,coords$',names[i], ')')))
            }
        }

        indexes <- unique(indexes) + 1

        return(indexes)
    }

    getVariables <- function(variablesType, variablesName){
        data <- variablesEnv$currentData
        if(variablesType == "compositions"){
            compositions <- data@compositions
            return(as.vector(eval(parse(text = paste0('compositions$', variablesName))) + 1))
        }else if(variablesType == "externals"){
            externals <- data@externals
            returm(as.vector(eval(parse(text = paste0('externals$', variablesName))) + 1))
        }else if(variablesType == "coords"){
            coords <- data@coords
            return(as.vector(eval(parse(text = paste0('coords$', variablesName))) + 1))
        }else if(variablesType == "ids"){
             ids <- data@ids
             return(as.vector(eval(parse(text = paste0('ids$', variablesName))) + 1))
        }else if(variablesType == "transformations"){
              return(as.data.frame(data@transformations[as.character(variablesName)]))
        }
    }

    getVariableFromTransformation <- function(variableName){
        data <- variablesEnv$currentData
        data <- data@transformations
        names <- names(data)
        variable <- NULL
        for(i in 1:length(names)){
            tmpTrans <- eval(parse(text = paste0('data$', names[i])))
            try <- tryCatch({variable <- tmpTrans[variableName]}, error = function(cond){return(NULL)})
            if(!is.null(try)){
                break;
            }
        }

        return(variable)
    }

###############################################################################################################################################
####################################################### DATA UPLOAD ###########################################################################
###############################################################################################################################################

    session$sendCustomMessage(type = 'allRPackages', message = sort(installed.packages()[,1]))
    createDataSelector(as.list(names(variablesEnv$dataList)))

  observe({
      file <- input$uploadCSVFile
      if(!is.null(file)){
        variablesEnv$uploadPath <- file$datapath

        session$sendCustomMessage(type = "createCSVFileOptionDialog", message = file$name)

      }
  })

  observe({
    file <- input$uploadRData
    if(!is.null(file)){
        variablesEnv$uploadPath <- file$datapath
        variablesEnv$tempData <- load(file$datapath)
        variablesEnv$tempData <- eval(parse(text = variablesEnv$tempData[1]))
        if(!is.null(variablesEnv$tempData)){
            variablesEnv$uploadPath <- NULL
            variablesEnv$availableGemasInfo <- FALSE
            session$sendCustomMessage(type = "createFileOptionDialog", message = file$name)
        }
    }
  })

  observe({
    if(!is.null(input$preview)){
        options <- input$preview
        if(!is.null(variablesEnv$uploadPath)){
            variablesEnv$tempData <- read.table(variablesEnv$uploadPath, nrows = 15, header = options$header,
                sep = options$separator, dec = options$decimal,
                quote = options$quotes)
        }

            session$sendCustomMessage(type = 'createPreviewTable', message = variablesEnv$tempData)
        }
  })

  observe({
    if(!is.null(input$uploadChosenFile)){
        options <- input$uploadChosenFile
        if(!is.null(variablesEnv$uploadPath)){
            tmp <- readLines(variablesEnv$uploadPath, n = 30)
            tmp <- tmp[substr(tmp, 1, 1) != '#']

            if(csvWithInfo(tmp[1]) == FALSE){
                variablesEnv$availableGemasInfo <- FALSE
                variablesEnv$tempData <- read.table(variablesEnv$uploadPath, header = options$header,
                        sep = options$separator, dec = options$decimal,
                        quote = options$quotes)
            }else{
                variablesEnv$availableGemasInfo <- TRUE
                importGemasCSV(options)
            }
        }
        variablesEnv$name <- options$name
        data <- list()
        data[["data"]] <- variablesEnv$tempData
        data[["names"]] <- names(variablesEnv$tempData)
        session$sendCustomMessage(type = 'createChooseVariableDialog', message = data)
     }
  })

  csvWithInfo <- function(firstEntry){
    if(length(grep('HEADER', firstEntry)) != 0){
        return(TRUE);
    }
    else if(length(grep('COMMENT DATASET', firstEntry)) != 0){
         return(TRUE);
    }
    else if(length(grep('SAMPLE IDENTIFIER', firstEntry)) != 0){
        return(TRUE);
    }
    else if(length(grep('COORDINATES', firstEntry)) != 0){
        return(TRUE);
    }
    else if(length(grep('VARIABLE', firstEntry)) != 0){
        return(TRUE);
    }
    else if(length(grep('UNIT', firstEntry)) != 0){
        return(TRUE);
    }
    else if(length(grep('EXTRACTION', firstEntry)) != 0){
        return(TRUE);
    }
    else if(length(grep('METHOD', firstEntry)) != 0){
        return(TRUE);
    }
    else if(length(grep('UDL', firstEntry)) != 0)
    {
        return(TRUE);
    }
    else if(length(grep('LDL', firstEntry)) != 0){
        return(TRUE);
    }
    else if(length(grep('COMMENT VARIABLES', firstEntry)) != 0){
        return(TRUE);
    }
    else{
        return(FALSE);
    }
  }

  importGemasCSV <- function(options){
    tmp <- read.table(variablesEnv$uploadPath, header = T,
                          sep = options$separator, dec = options$decimal,
                          quote = options$quotes)

    skip <- (1:length(tmp[,1]))[tmp[,1]==""][1]

    tmp <- read.table(variablesEnv$uploadPath, header = T, sep = options$sep, dec = options$decimal, skip = skip)
    colNames <- names(tmp["VARIABLE"==tmp[,1],])

    tmp <- read.table(variablesEnv$uploadPath, header = F,
                      sep = options$separator, dec = options$decimal,
                      quote = options$quotes)

    tmp <- as.matrix(tmp)

    gemasInfo <- new("gemasInfo")
  for ( i in 1:skip ) {
    l <- tmp[i,]
    print(l[1])
    if( l[1]=="HEADER" ) {
      gemasInfo@header <- paste(l[-1],sep="",collapse="")
      print(gemasInfo@header)
      }
    if( l[1]=="COMMENT DATASET" ) {
      gemasInfo@comment <- paste(l[-1],sep="",collapse="")
      print(gemasInfo@comment)
      }
    if( l[1]=="SAMPLE IDENTIFIER" ) {
      gemasInfo@id <- as.vector(l[-1])
      print(gemasInfo@id)
      }
    if( l[1]=="COORDINATES" ) {
      gemasInfo@coords <- as.vector(l[-1])
      print(gemasInfo@coords)
      }
    if( l[1]=="VARIABLE" ) {
      gemasInfo@variable <- colNames
      print(gemasInfo@variable)
      }
    if( l[1]=="UNIT" ) {
    print(class(l[-1]))
      gemasInfo@unit <- as.vector(l[-1])
      print(gemasInfo@unit)
      }
    if( l[1]=="EXTRACTION" ) {
      gemasInfo@extraction <- as.vector(l[-1])
      print(gemasInfo@extraction)
      }
    if( l[1]=="METHOD" ) {
      gemasInfo@method <- as.vector(l[-1])
      print(gemasInfo@method)
      }
    if( l[1]=="UDL" ) {
      gemasInfo@UDL <- as.numeric(l[-1])
      print(gemasInfo@UDL)
      }
    if( l[1]=="LDL" ) {
      gemasInfo@LDL <- as.numeric(l[-1])
      print(gemasInfo@LDL)
      }
    if( l[1]=="COMMENT VARIABLES" ) {
      comment_var <- as.vector(l[-1])
      print(comment_var)
      }
    }

    if ( !is.na(gemasInfo@id[1]) ) gemasInfo@id <- colNames[gemasInfo@id != ""]
    if ( length(gemasInfo@id) != 1 ) gemasInfo@id <- NA
    xcoo <- colNames[ gemasInfo@coords == "XCOO" ]
    if ( length(xcoo) != 1 ) xcoo <- NA
    ycoo <- colNames[ gemasInfo@coords == "YCOO" ]
    if ( length(ycoo) != 1 ) ycoo <- NA
    gemasInfo@coords <- c(xcoo,ycoo)
    str(gemasInfo)
    variablesEnv$tempGemasInfo <- gemasInfo

    try <- tryCatch({variablesEnv$tempData <- read.table(variablesEnv$uploadPath, header = T,
                                        sep = options$separator, dec = options$decimal,
                                        quote = options$quotes, skip = skip)}, error = function(cond){return(NULL)})

    if(is.null(try)){
        sendPopUpMessage('ERROR: corrupted file!')
        resetConnector('uploadChosenFile')
        return(NULL)
    }

    variablesEnv$tempData <- variablesEnv$tempData[,-1]

  }

 observe({
    if(!is.null(input$chosenVariables)){
        chosenVariables <- input$chosenVariables
        names <- (names(chosenVariables))
        types <- unlist(chosenVariables$type)
        variablesTypes <- unlist(chosenVariables$variablesTypes)

        tmp <- variablesEnv$tempData
        for(index in (1: length(variablesTypes))){
            eval(parse(text = paste0('tmp[,index] <- as.', variablesTypes[index],'(tmp[,index])')))
        }
        data <- new("compData", tmp, availableGemasInfo = variablesEnv$availableGemasInfo)
        data@variablesTypes <- variablesTypes

        for(index in 1:length(types)){
            variables <- unlist(chosenVariables[index])
            if(!is.null(variables)){
                if(types[index] == "comp"){
                    data@compositions[[names[index]]] <- variables
                }
                else if(types[index] == "extern"){
                    data@externals[[names[index]]] <- variables
                }
                else if(types[index] == "coord"){
                    data@coords[[names[index]]] <- variables
                }
                else{
                    data@ids[[names[index]]] <- variables
                }
            }
        }
        if(variablesEnv$availableGemasInfo){
            data@gemasInfo <- variablesEnv$tempGemasInfo
        }

        eval(parse(text = paste0("variablesEnv$dataList$",variablesEnv$name ,"<- data")))
        variablesEnv$uploadPath <- NULL

        sendPopUpMessage('Chosen data was successfully upladed!')
        names <- as.list(names(variablesEnv$dataList))
        createDataSelector(names)
    }
  })

    # chosen data from the data selector
    observe({
        input$dataSelectorChosenData
        if(!is.null(input$dataSelectorChosenData)){
            if(input$dataSelectorChosenData != ""){
                if(!is.null(variablesEnv$currentDataName)){
                    eval(parse(text = paste0("variablesEnv$dataList$",variablesEnv$currentDataName ,"<-variablesEnv$currentData")))
#                    eval(parse(text = paste0("detach(variablesEnv$dataList$",variablesEnv$currentDataName ,")")))
                }

                variablesEnv$currentDataName <- as.character(input$dataSelectorChosenData)
                variablesEnv$currentData <- variablesEnv$dataList[as.character(input$dataSelectorChosenData)]
                variablesEnv$currentData <- eval(parse(text = paste0("variablesEnv$currentData$", as.character(input$dataSelectorChosenData))))
#                eval(parse(text = paste0("attach(variablesEnv$dataList$",variablesEnv$currentDataName ,")")))
                renderDataInformation(createJSObject())

            }
        }
    })

    # chosen package
    observe({
        input$chosenPackage
        if(!is.null(input$chosenPackage)){
            eval(parse(text = paste0("library(", input$chosenPackage, ")")))
            eval(parse(text = paste0('availableDataInThePackage <- data(package = "', input$chosenPackage, '")$results[,3]')))
            if(length(availableDataInThePackage) == 0){
                sendPopUpMessage('Chosen package contains no data!')
            }
            else{
                session$sendCustomMessage(type = 'availableDataInThePackage', message = availableDataInThePackage)
                variablesEnv$availableGemasInfo <- FALSE
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

#######################################################################################################################################
############################################################ EDIT DATA ################################################################
#######################################################################################################################################
########################################################## REMOVE #####################################################################
observe({
    options <- input$removeColumn
    if(!is.null(options)){
        indexes <- unlist(options$indexes)
        data <- variablesEnv$currentData
        Data <- as.data.frame(data@.Data)
        tmpNames <- names(data)
        tmpNames <- tmpNames[- (indexes + 1)]
        Data <- Data[-(indexes + 1)]
        data@.Data <- Data
        names(data) <- tmpNames
        compositions <- data@compositions
        tmpNames <- names(compositions)

        if(length(tmpNames) > 0){
            for(i in (1: length(tmpNames))){
                comp <- eval(parse(text = paste0('compositions$', tmpNames[i])))
                for(k in (1 : length(indexes))){
                  indexesToDelete <- which(comp == indexes[k])
                  if(length(indexesToDelete) > 0){
                      comp <- comp[-indexesToDelete]
                  }
              }
              
              for(j in (1 :length(indexes))){
                if(length(comp[comp >= indexes[j]]) > 0){
                  comp[comp >= indexes[j]] <- comp[comp >= indexes[j]] - 1
                }
              }
              if(length(comp) == 0){
                comp <- c()
              }
              eval(parse(text = paste0('compositions$', tmpNames[i], ' <- comp')))
            }
            data@compositions <- compositions
        }

        externals <- data@externals
        tmpNames <- names(externals)
        if(length(tmpNames) > 0){
          for(i in (1: length(tmpNames))){
            ext <- eval(parse(text = paste0('externals$', tmpNames[i])))
            for(k in (1 : length(indexes))){
              indexesToDelete <- which(ext == indexes[k])
              if(length(indexesToDelete) > 0){
                ext <- ext[-indexesToDelete]
              }
            }
            
            for(j in (1 :length(indexes))){
              if(length(ext[ext >= indexes[j]]) > 0){
                ext[ext >= indexes[j]] <- ext[ext >= indexes[j]] - 1
              }
            }
            if(length(ext) == 0){
              ext <- c()
            }
            eval(parse(text = paste0('externals$', tmpNames[i], ' <- ext')))
          }
          data@externals <- externals
        }

        coords <- data@coords
        tmpNames <- names(coords)
        if(length(tmpNames) > 0){
          for(i in (1: length(tmpNames))){
            coord <- eval(parse(text = paste0('coords$', tmpNames[i])))
            for(k in (1 : length(indexes))){
              indexesToDelete <- which(coord == indexes[k])
              if(length(indexesToDelete) > 0){
                coord <- coord[-indexesToDelete]
              }
            }
            
            for(j in (1 :length(indexes))){
              if(length(coord[coord >= indexes[j]]) > 0){
                coord[coord >= indexes[j]] <- coord[coord >= indexes[j]] - 1
              }
            }
            if(length(coord) == 0){
              coord <- c()
            }
            eval(parse(text = paste0('coords$', tmpNames[i], ' <- coord')))
          }
          data@coords <- coords
        }

        ids <- data@ids
        tmpNames <- names(ids)
        if(length(tmpNames) > 0){
          for(i in (1: length(tmpNames))){
            id <- eval(parse(text = paste0('ids$', tmpNames[i])))
            for(k in (1 : length(indexes))){
              indexesToDelete <- which(id == indexes[k])
              if(length(indexesToDelete) > 0){
                id <- id[-indexesToDelete]
              }
            }
            
            for(j in (1 :length(indexes))){
              if(length(id[id >= indexes[j]]) > 0){
                id[id >= indexes[j]] <- id[id >= indexes[j]] - 1
              }
            }
            if(length(id) == 0){
              id <- c()
            }
            eval(parse(text = paste0('ids$', tmpNames[i], ' <- id')))
          }
          data@ids <- ids
        }
        
        variablesEnv$currentData <- data
        renderDataInformation(createJSObject())
        sendPopUpMessage('Column(s) successfully removed!')
        resetConnector('removeColumn')
        setDataAndGroup(variablesEnv$currentDataName, options$group, options$subset)
    }
})

############################################################ ADD ######################################################################
    observe({
        options <- input$addOrEditColumn
        if(!is.null(options)){
            data <- variablesEnv$currentData
            Data <- as.data.frame(data@.Data)
            names(Data) = names(data)
            names <- unlist(options$names)
            commands <- unlist(options$commands)
            attach(data)

            for(i in (1: length(commands))){
                try <- tryCatch({eval(parse(text = commands[i]))}, error = function(cond){return(NULL)})
                if(is.null(try)){
                    sendPopUpMessage('Invalid command!');
                    detach(data)
                    return(NULL);
                }else{
                    eval(parse(text = paste0('Data["', names[i], '"] <-', names[i])))
                }
            }
            
            detach(data)
            data@.Data <- Data
            names(data) <- names(Data)
            variablesEnv$currentData <- data
            renderDataInformation(createJSObject())
            setDataAndGroup(variablesEnv$currentDataName, options$group, options$subset)
            sendPopUpMessage(options$message)
            resetConnector('addOrEditColumn')
        }
    })

########################################################################################################################################
################################################################### DATA MANIPULATION ##################################################
########################################################################################################################################
################################################################### IMPUTATION #########################################################
############################################ impCoda ###################################################################################
    observe({
        options <- input$impCodaImp
        if(!is.null(options)){
            data <- as.data.frame(variablesEnv$currentData)
            variablesEnv$currentVariableGroup <- (unlist(options$variablesGroup) + 1)
            variablesEnv$currentSubset <- (unlist(options$subsetGroup) + 1)
            if(length(variablesEnv$currentVariableGroup) != 0){
                data <- data[variablesEnv$currentVariableGroup]
            }

            try <- tryCatch({eval(parse(text = paste0('tmp <- impCoda(x = data, ', 'maxit=', options$maxit, ', method="', options$method, '")')))},
                            error = function(cond){return(NULL)})
            if(is.null(try)){
                sendPopUpMessage("ERROR: too much NA's on one row!")
            }
            else{
                data <- variablesEnv$currentData
                tmp <- tmp$xImp
                data <- replaceOriginalDataWithImputation(data, tmp)

                if(options$name != 0){
                    options(options$name, data)
                }else{
                    variablesEnv$currentData <- data
                }
                renderDataInformation(createJSObject())
                setDataAndGroup(variablesEnv$currentDataName, options$group, options$subset)
                sendPopUpMessage('Imputation successfully done!')
                resetConnector('impCoda')
            }
         }
    })

########################################### impKNNa ############################################
    observe({
        options <- input$impKNNaImp
        if(!is.null(options)){
            data <- as.data.frame(variablesEnv$currentData)
            variablesEnv$currentVariableGroup <- (unlist(options$variablesGroup) +1)
            if(length(variablesEnv$currentVariableGroup) != 0){
                data <- data[variablesEnv$currentVariableGroup]
            }

            try <- tryCatch({eval(parse(text = paste0('tmp <- impKNNa(x = data, ', 'k=', options$k,')')))},
                            error = function(cond){return(NULL)})
            if(is.null(try)){
                sendPopUpMessage("ERROR: too much NA's on one row!")
            }
            else{
                data <- variablesEnv$currentData
                tmp <- tmp$xImp
                data <- replaceOriginalDataWithImputation(data, tmp)

                if(options$name != 0){
                    addNewDataToDataList(options$name, data)
                }else{
                    variablesEnv$currentData <- data
                }
                renderDataInformation(createJSObject())
                setDataAndGroup(variablesEnv$currentDataName, options$group, options$subset)
                sendPopUpMessage('Imputation successfully done!')
                resetConnector('impKNNa')
            }
         }
    })

########################################## kNN #################################################
    observe({
        options <- input$kNNImp
        if(!is.null(options)){
           data <- as.data.frame(variablesEnv$currentData)
           variablesEnv$currentVariableGroup <- (unlist(options$variablesGroup) +1)
            if(length(variablesEnv$currentVariableGroup) != 0){
                data <- data[variablesEnv$currentVariableGroup]
            }

            try <- tryCatch({eval(parse(text = paste0('tmp <- kNN(data = data, ', 'k=', options$k, ')')))},
                            error = function(cond){return(NULL)})

            if(is.null(try)){
                sendPopUpMessage("ERROR: too much NA's on one row!")
            }
            else
            {
                tmp <- tmp[1:length(data)]

                data <- variablesEnv$currentData
                data <- replaceOriginalDataWithImputation(data, tmp)

                if(options$name != 0){
                    addNewDataToDataList(options$name, data)
                }else{
                    variablesEnv$currentData <- data
                }

                renderDataInformation(createJSObject())
                setDataAndGroup(variablesEnv$currentDataName, options$group, options$subset)
                sendPopUpMessage('Imputation successfully done!')
                resetConnector('kNNImp')
            }
         }
    })

############################################ irmi ################################################
    observe({
        options <- input$irmiImp
        if(!is.null(options)){
            data <- as.data.frame(variablesEnv$currentData)
            variablesEnv$currentVariableGroup <- (unlist(options$variablesGroup) +1)
            if(length(variablesEnv$currentVariableGroup) != 0){
                data <- data[variablesEnv$currentVariableGroup]
            }

            try <- tryCatch({eval(parse(text = paste0('tmp <- irmi(x = data)')))},
                            error = function(cond){return(NULL)})

            if(is.null(try)){
                sendPopUpMessage("ERROR: too much NA's on one row!")
            }
            else{
                data <- variablesEnv$currentData
                data <- replaceOriginalDataWithImputation(data, tmp)

                if(options$name != 0){
                    addNewDataToDataList(options$name, data)
                }else{
                    variablesEnv$currentData <- data
                }
                renderDataInformation(createJSObject())
                setDataAndGroup(variablesEnv$currentDataName, options$group, options$subset)
                sendPopUpMessage('Imputation successfully done!')
                resetConnector('irmiImp')
            }
         }
    })


    replaceOriginalDataWithImputation <- function(data, imputation){
        Data <- data@.Data
        if(length(variablesEnv$currentVariableGroup) != 0){
            Data[variablesEnv$currentVariableGroup] <- as.data.frame(imputation)
            data@.Data <- Data
        }
        else{
            Data <- tmp
            data@.Data <- imputation
        }
        return(data)
    }


#######################################################################################################################################
######################################################### DETECTION LIMIT #############################################################
#######################################################################################################################################
######################################################### impRZilr ####################################################################
    observe({
        options <- input$inpRZilr
        if(!is.null(options)){
            data <- as.data.frame(variablesEnv$currentData)
            variablesEnv$currentVariableGroup <- (unlist(options$variablesGroup) + 1)
            dl <- data@gemasInfo
            dl <- dl@LDL
            dl <- as.numeric(dl)
            if(length(options$variablesGroup) != 0){
                data <- data[variablesEnv$currentVariableGroup]
                dl <- dl[variablesEnv$currentVariableGroup]
            }

            try <- tryCatch({eval(parse(text = paste0('tmp <- impRZilr(x = data, dl = dl, method = "', options$method ,'")')))},
                            error = function(cond){return(NULL)})

            if(is.null(try)){
                sendPopUpMessage("ERROR occoured!")
            }else{
                data <- variablesEnv$currentData
                data <- replaceOriginalDataWithImputation(data, tmp$x)

                if(options$name != 0){
                    addNewDataToDataList(options$name, data)
                }
                else{
                    variablesEnv$currentData <- data
                }

                renderDataInformation(createJSObject())
                setDataAndGroup(variablesEnv$currentDataName, options$group, options$subset)
                sendPopUpMessage('Imputation successfully done!')
                resetConnector('impRZilr')
            }
        }
    })

########################################################## DL * factor #################################################################
    observe({
        options <- input$DLMultiplyByFactor
        if(!is.null(options)){
            data <- as.data.frame(variablesEnv$currentData)
            variablesEnv$currentVariableGroup <- (unlist(options$variablesGroup) + 1)
            constant <- options$constant
            dl <- data@gemasInfo
            dl <- dl@LDL
            dl <- as.numeric(dl)
            if(length(options$variablesGroup) != 0){
                data <- data[variablesEnv$currentVariableGroup]
                dl <- dl[variablesEnv$currentVariableGroup]
            }
            tmp <- c()
            for(i in (1: length(dl))){
                col <- data[i]
                if(length(col[col < dl[i]]) > 0){
                    col[col < dl[i]] <- eval(parse(text = paste(dl[i],'*',constant)))
                }
                tmp[i] <- col
            }

            data <- variablesEnv$currentData
            data <- replaceOriginalDataWithImputation(data, tmp)

            if(options$name != 0){
                addNewDataToDataList(options$name, data)
             }else{
                variablesEnv$currentData <- data
             }

             renderDataInformation(createJSObject())
             setDataAndGroup(variablesEnv$currentDataName, options$group, options$subset)
             sendPopUpMessage('Imputation successfully done!')
             resetConnector('DLMultiplyByFactor')
        }
    })

#######################################################################################################################################
######################################################### TRANSFORMATIONS #############################################################
#######################################################################################################################################
########################################################### addLR #####################################################################
    observe({
        options <- input$addLR
        if(!is.null(options)){
            data <- as.data.frame(variablesEnv$currentData)
            variablesEnv$currentVariableGroup <- (as.numeric(unlist(options$variablesGroup)) + 1)
            if(length(options$variablesGroup) != 0){
                data <- data[variablesEnv$currentVariableGroup]
            }

            try <- tryCatch({eval(parse(text = paste0('tmp <- addLR(x = data, ivar = ', as.numeric(options$ivar), ')')))},
                            error = function(cond){return(NULL)})

            if(is.null(try)){
                sendPopUpMessage("ERROR occoured!")
            }
            else
            {
                tmp <- tmp$x.alr
                oldNames <- names(tmp)
                newNames <- c()
                for(i in (1:length(oldNames))){
                    newNames[i] <- paste0(oldNames[i], '_', options$ivarName)
                }
                tmp <- as.data.frame(tmp)
                names(tmp) <- newNames
                data <- as.data.frame(variablesEnv$currentData)
                eval(parse(text = paste0('data@transformations$', as.character(options$name), '<- as.data.frame(tmp)')))

                variablesEnv$currentData <- data
                renderDataInformation(createJSObject())
                sendPopUpMessage('Transformation successfully done!')
                resetConnector('addLR')
                setDataAndGroup(variablesEnv$currentDataName, options$name, options$subset)
            }
        }
    })

########################################################## cenLR ######################################################################
    observe({
        options <- input$cenLR
        if(!is.null(options)){
            data <- as.data.frame(variablesEnv$currentData)
            variablesEnv$currentVariableGroup <- (as.numeric(unlist(options$variablesGroup)) + 1)
            if(length(options$variablesGroup) != 0){
                data <- data[variablesEnv$currentVariableGroup]
            }

            try <- tryCatch({eval(parse(text = 'tmp <- cenLR(x = data)'))}, error = function(cond){return(NULL)})

            if(is.null(try)){
                sendPopUpMessage("ERROR occoured!")
            }
            else
            {
                tmp <- tmp$x.clr
                oldNames <- names(tmp)
                newNames <- c()
                for(i in (1:length(oldNames))){
                    newNames[i] <- paste0(oldNames[i],'_clr')
                }

                names(tmp) <- newNames
                data <- as.data.frame(variablesEnv$currentData)
                eval(parse(text = paste0('data@transformations$', as.character(options$name), '<- as.data.frame(tmp)')))

                variablesEnv$currentData <- data
                renderDataInformation(createJSObject())
                sendPopUpMessage('Transformation successfully done!')
                resetConnector('cenLR')
                setDataAndGroup(variablesEnv$currentDataName, options$name, options$subset)
            }

        }
    })

########################################################## isomLR ######################################################################
    observe({
        options <- input$isomLR
        if(!is.null(options)){
            data <- as.data.frame(variablesEnv$currentData)
            variablesEnv$currentVariableGroup <- (as.numeric(unlist(options$variablesGroup)) + 1)
            if(length(options$variablesGroup) != 0){
                data <- data[variablesEnv$currentVariableGroup]
            }

            try <- tryCatch({eval(parse(text = 'tmp <- isomLR(x = data)'))}, error = function(cond){return(NULL)})
            if(is.null(try)){
                sendPopUpMessage("ERROR occoured!")
            }
            else
            {
                tmp <- as.data.frame(tmp)
                oldNames <- names(tmp)
                newNames <- c()
                for(i in (1:length(oldNames))){
                    newNames[i] <- paste0('ilr_', i)
                }

                names(tmp) <- newNames
                data <- as.data.frame(variablesEnv$currentData)
                eval(parse(text = paste0('data@transformations$', as.character(options$name), '<- as.data.frame(tmp)')))

                variablesEnv$currentData <- data
                renderDataInformation(createJSObject())
                sendPopUpMessage('Transformation successfully done!')
                resetConnector('isomLR')
                setDataAndGroup(variablesEnv$currentDataName, options$name, options$subset)
            }



        }
    })
############################################################ command #####################################################################
    observe({
        options <- input$transformationCommand
        if(!is.null(options)){
            data <- as.data.frame(variablesEnv$currentData)
            variablesEnv$currentVariableGroup <- (as.numeric(unlist(options$variablesGroup)) + 1)
            if(length(options$variablesGroup) != 0){
                data <- data[variablesEnv$currentVariableGroup]
            }

            try <- tryCatch({eval(parse(text = paste0('tmp <-', options$command ,'(data)')))}, error = function(cond){return(NULL)})
            if(is.null(try)){
                sendPopUpMessage("ERROR: chosen method does not exist or can\'t be applied on chosen data!")
            }
            else{
                oldNames <- names(tmp)
                newNames <- c()
                for(i in (1:length(oldNames))){
                    newNames[i] <- paste0(oldNames[i], '_', options$command)
                }
                names(tmp) <- newNames
                data <- as.data.frame(variablesEnv$currentData)
                eval(parse(text = paste0('data@transformations$', as.character(options$name), '<- as.data.frame(tmp)')))

                variablesEnv$currentData <- data
                renderDataInformation(createJSObject())
                sendPopUpMessage('Transformation successfully done!')
                resetConnector('log')
                setDataAndGroup(variablesEnv$currentDataName, options$name, options$subset)
            }
        }
    })

#######################################################################################################################################
################################################### DEFINE NEW VARIABLES GROUP ########################################################
#######################################################################################################################################

    observe({
        options <- input$newDefinedVariablesGroups
        if(!is.null(options)){
            data <- variablesEnv$currentData
            groupNames <- names(options)
            groupNames <- groupNames[-length(groupNames)]
            if(options$type == "transformations"){
                nrow = options[1]
                eval(parse(text = paste0('nrow <- nrow$', groupNames[1])))
                nrow <- nrow[as.character((names(nrow)[1]))]
                eval(parse(text = paste0('nrow <- nrow$', names(nrow))))
                nrow[unlist(lapply(nrow, is.null))] <- NA
                nrow <- length(unlist(nrow))

                for(i in (1: length(groupNames))){
                    tmpOptions <- options[i]
                    eval(parse(text = paste0('tmpOptions <- tmpOptions$', groupNames[i])))
                    names <- names(tmpOptions)
                    tmp <- matrix(0, ncol = length(names), nrow = nrow)
                    tmp <- as.data.frame(tmp)
                    names(tmp) <- names

                    for(j in (1:length(names))){
                        currentTmpOptions <- tmpOptions[as.character(names[j])]
                        eval(parse(text = paste0('currentTmpOptions <- currentTmpOptions$', names(currentTmpOptions))))
                        currentTmpOptions[unlist(lapply(currentTmpOptions, is.null))] <- NA
                        eval(parse(text = paste0('tmp[', j, '] <-', as.vector(unlist(currentTmpOptions)))))
                    }
                    data@transformations[[as.character(groupNames[i])]] <- tmp
                }
            }else{
                for(i in (1:length(groupNames))){
                    variables <- unlist(options[i])
                    if(options$type == "comp"){
                        data@compositions[[groupNames[i]]] <- variables
                    }
                    else if(options$type == "extern"){
                        data@externals[[groupNames[i]]] <- variables
                    }
                    else if(options$type == "coord"){
                        data@coords[[groupNames[i]]] <- variables
                    }
                    else{
                        data@ids[[groupNames[i]]] <- variables
                    }
                }
            }
            variablesEnv$currentData <- data
            sendPopUpMessage('New data variables groups were successfully created!')
            resetConnector('newDefinedVariablesGroups')
        }
    })

#######################################################################################################################################
################################################# DEFINE NEW OBSERVATIONS GROUP #######################################################
#######################################################################################################################################
################################################################ COMMAND ##############################################################
    observe({
        options <- input$defineObservationsCommand
        if(!is.null(options)){
            commands <- as.vector(unlist(options$commands))
            data <- variablesEnv$currentData
            attach(data)
            indexes <- c()
            for(i in (1 : length(commands))){
                try <- tryCatch({indexes <- c(indexes, eval(parse(text = paste0('which(', commands[i], ')'))))}, error = function(cond){return(NULL)})
                if(is.null(try)){
                    sendPopUpMessage('Invalid command!');
                    detach(data)
                    return(NULL);
                }
            }
            indexes <- unique(indexes)
            indexes <- sort(indexes) - 1

            data@subsets[[options$name]] <- indexes

            detach(data)
            variablesEnv$currentData <- data

            sendPopUpMessage('Observation group was successfully defnined!')
            renderDataInformation(createJSObject())
            setDataAndGroup(variablesEnv$currentDataName, options$group, options$name)
            resetConnector('defineObservationsCommand')
        }
    })

################################################################ FACTOR ##############################################################

    observe({
        options <- input$defineObservationsFactor
        if(!is.null(options)){
           data <- variablesEnv$currentData
            subsetNames <- names(options)
            for(i in (1: length(subsetNames))){
                indexes <- unlist(options[i])
                data@subsets[[subsetNames[i]]] <- indexes
            }
            variablesEnv$currentData <- data

            sendPopUpMessage('Observation group(s) was successfully defnined!')
            resetConnector('defineObservationsFactor')
        }
    })


#######################################################################################################################################
################################################################ PLOT #################################################################
#######################################################################################################################################
############################################################## BAR-PLOT ###############################################################
############################################################ VARIABLES ################################################################
 observe({
    options <- input$variablesBarPlot
    if(!is.null(options)){
        data <- variablesEnv$currentData
        variables <- c()
        if(options$variablesType == 'transformations'){
            data <- getVariables(options$variablesType, options$variablesName)
        }else{
            variables <- getVariables(options$variablesType, options$variablesName)
        }

        if(length(variables) > 0){
            data <- data[, variables]
        }

        if(options$useSubset && length(options$currentSubset) > 0){
            subset <- unlist(options$currentSubset) + 1
            data <- data[subset,]
        }
        results <- list()
        names <- names(data)
        for(i in 1:length(data)){
            try <- tryCatch({eval(parse(text = paste0('results[[names[i]]] <- ',options$method, '(data[,i])' )))},
                            error = function(cond){return(NULL)})

            if(is.null(try) || length(results[[names[i]]]) > 1){
                sendPopUpMessage(paste0('ERROR: method "', options$method, '" is not supported' ))
                resetConnector('variablesBarPlot')
                return(NULL)
            }
        }
        message = list()
        message[['title']] <- options$title
        message[['yAxis']] <- options$yAxis
        message[['data']] <- results
        session$sendCustomMessage(type ='plotBarPlot', message = message)
        resetConnector('variablesBarPlot')
    }
 })


########################################################################################################################################
############################################################## GROUP BAR PLOT ##########################################################
########################################################################################################################################
observe({
    options <- input$groupBarPlot
    if(!is.null(options)){
        data <- variablesEnv$currentData
        factors <- unlist(data[options$factor])
        uniqueFactors <- unique(factors)
        variables <- c()

        if(options$variablesType == 'transformations'){
            data <- getVariables(options$variablesType, options$variablesName)
        }else{
            variables <- getVariables(options$variablesType, options$variablesName)
        }

        if(length(variables) > 0){
            data <- data[, variables]
        }

        names <- names(data)
        if(options$useSubset && length(options$currentSubset) > 0){
            subset <- unlist(options$currentSubset) + 1
            data <- data[subset,]
        }

        results <- list()
        notToUseIndexes <- c()
        for(i in 1:length(uniqueFactors)){
            indexes <- which(factors == uniqueFactors[i])
            tmpResult <- c()
            verifInd <- 1
            for(j in 1:length(names)){
                if(is.numeric(unlist(data[names[j]]))){
                    tmpData <- data[names[j]]

                    tmpData <- tmpData[indexes, ]

                    tmpData <- tmpData[complete.cases(tmpData)]

                    try <- tryCatch({eval(parse(text = paste0('tmpResult <- c(tmpResult,', options$method, '(tmpData))')))},
                            error = function(cond){return(NULL)})

                    if(is.null(try) || (verifInd == 1 && length(tmpResult) > 1)){
                        sendPopUpMessage(paste0('ERROR: method "', options$method, '" is not supported' ))
                        resetConnector('groupBarPlot')
                        return(NULL)
                    }
                    
                    verifInd <- verifInd + 1
                }else{
                    notToUseIndexes <- c(notToUseIndexes, j)
                }
            }

            results[[uniqueFactors[i]]] <- tmpResult
        }

        if(is.null(results) || length(results) == 0){
            sendPopUpMessage('ERROR: chosen data can\'t be ploted')
            return(NULL)
        }
        results <- as.data.frame(results)
        names(results) <- uniqueFactors
        if(!is.null(notToUseIndexes)){
            names <- names[-notToUseIndexes]
        }
        message <- list()
        message[["data"]] <- results
        message[["names"]] <- names
        message[['title']] <- options$title
        message[['yAxis']] <- options$yAxis

        session$sendCustomMessage(type = 'plotGroupBarPlot', message = message)
        resetConnector('groupBarPlot')
    }

})


########################################################################################################################################
################################################################ BOXPLOT ###############################################################
########################################################################################################################################
################################################################# FACTORS ##############################################################
 observe({
    options <- input$boxPlotFactor
    if(!is.null(options)){
        data <- variablesEnv$currentData
        factors <- unlist(data[options$factor])
        uniqueFactors <- unique(factors)

        try <- tryCatch({data <- data[options$variable]}, error = function(cond){return(NULL)})
        if(is.null(try)){
            data <- getVariableFromTransformation(options$variable)
            if(is.null(data)){
                sendPopUpMessage(paste0('ERROR: variable "', options$variable,'" doesn\'t exist on this data-set!'))
                return(NULL)
            }
        }
        str(data)
        dataLength <- length(data[,1])
        if(options$method != ""){
            try <- tryCatch({eval(parse(text = paste0('data <- ', options$method,'(data)')))},
                        error = function(cond){return(NULL)})
            str(data)
            if(is.null(try) || length(data[,1]) != dataLength){
                sendPopUpMessage(paste0('ERROR! function "', options$method, '" is not supported!'))
                return(NULL)
            }
        }

        if(options$useSubset && length(options$currentSubset) > 0){
           subset <- unlist(options$currentSubset) + 1
            data <- as.data.frame(data[subset,])
        }

        results <- list()
        upperOutliers <- list()
        lowerOutliers <- list()
        for(i in 1:length(uniqueFactors)){
            indexes <- which(factors == uniqueFactors[i])
            tmpData <- data[indexes,]
            tmpData <- tmpData[complete.cases(tmpData)]

            try <- tryCatch({box <- boxplot(tmpData, plot=F)}, error = function(cond){return(NULL)})
            if(is.null(try)){
                sendPopUpMessage('ERROR: something went wrong!')
                return(NULL)
            }else{
                results[[uniqueFactors[i]]] <- as.vector(box$stats)
                upperOut <- as.vector(tmpData[tmpData > box$stats[5]])
                if(length(upperOut) > 0){
                    upperOutliers[[uniqueFactors[i]]] <- as.vector(upperOut)
                }else
                {
                    upperOutliers[[uniqueFactors[i]]] <- as.list("no")
                }
                lowerOut <- as.vector(tmpData[tmpData < box$stats[1]])
                if(length(lowerOut) > 0){
                    lowerOutliers[[uniqueFactors[i]]] <- as.vector(lowerOut)
                }else{
                    lowerOutliers[[uniqueFactors[i]]] <- as.list("no")
                }
            }
        }
        names(results) <- uniqueFactors
        names(upperOutliers) <- uniqueFactors
        names(lowerOutliers) <- uniqueFactors

        message <- list()
        message[['results']] <- results
        message[['upperOutliers']] <- upperOutliers
        message[['lowerOutliers']] <- lowerOutliers
        message[['categories']] <- uniqueFactors
        message[['title']] <- options$title

        session$sendCustomMessage(type = 'plotBoxPlot', message = message)
        resetConnector('boxPlotFactor')
    }
 })

 ############################################################### VARIABLES ###########################################################
 observe({
    options <- input$boxPlotVariables
    if(!is.null(options)){
        data <- variablesEnv$currentData
        variables <- c()

        if(options$variablesType == 'transformations'){
            data <- getVariables(options$variablesType, options$variablesName)
        }else{
            variables <- getVariables(options$variablesType, options$variablesName)
        }

        if(length(variables) > 0){
            data <- data[, variables]
         }

        names <- names(data)
        if(options$useSubset && length(options$currentSubset) > 0){
            subset <- unlist(options$currentSubset) + 1
            data <- data[subset,]
        }

        results <- list()
        upperOutliers <- list()
        lowerOutliers <- list()
        for(i in 1:length(names)){
            tmpData <- data[names[i]]

            try <- tryCatch({box <- boxplot(tmpData, plot=F)}, error = function(cond){return(NULL)})
            if(is.null(try)){
                sendPopUpMessage('ERROR: something went wrong!')
                return(NULL)
            }else{
                results[[names[i]]] <- as.vector(box$stats)
                upperOut <- as.vector(tmpData[tmpData > box$stats[5]])
                if(length(upperOut) > 0){
                    upperOutliers[[names[i]]] <- upperOut
                }else
                {
                    upperOutliers[[names[i]]] <- as.list("no")
                }
                lowerOut <- as.vector(tmpData[tmpData < box$stats[1]])
                if(length(lowerOut) > 0){
                    lowerOutliers[[names[i]]] <- lowerOut
                }else{
                    lowerOutliers[[names[i]]] <- as.list("no")
                }
            }
        }
        names(results) <- uniqueFactors
        names(upperOutliers) <- uniqueFactors
        names(lowerOutliers) <- uniqueFactors

        message <- list()
        message[['results']] <- results
        message[['upperOutliers']] <- upperOutliers
        message[['lowerOutliers']] <- lowerOutliers
        message[['categories']] <- names
        message[['title']] <- options$title

        session$sendCustomMessage(type = 'plotBoxPlot', message = message)
        resetConnector('boxPlotVariables')
    }
 })



})

