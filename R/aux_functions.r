### create obj ###
#library(comp)
#data(francdat)

#dat <- francdat
#numVars <- c(1,3,7)
#weightVar <- 8
#keyVars <- c(2,4:6)

# v: either a numeric vector specifying column-indices
# or a character vector specifying column-names
standardizeInput <- function(obj, v) {
	if ( class(obj) != "compObj" ) 
		stop("obj must be an object of class 'compObj'!\n")
	
	if ( is.numeric(v) ) {
		if ( all(v %in% 1:ncol(get.compObj(obj, type="origData"))) ) {
			return(v)
		} else {
			stop("please specify valid column-indices!\n")
		}
	} else if ( is.character(v) ) {
		m <- match(v, colnames(get.compObj(obj, type="origData")))
		if ( !any(is.na(m)) ) {
			return(m)
		} else {
			stop("please specify valid column-names!\n")
		}
	} else {
		stop("please specify either a numeric vector specifying column-indices or a character vector containing valid variable names!\n")		
	}
}


createCompObj <- function(dat, compVars1=NULL, compVars2=NULL, compVars3=NULL, 
                          coordinates=NULL, external=NULL, subset=NULL, options=NULL) {

	obj <- new("compObj")
 	if(!is.data.frame(dat))
    	dat <- as.data.frame(dat)
	
	obj <- set.compObj(obj, type="origData", input=list(dat))
	# key-variables
	keyVarInd <- standardizeInput(obj, keyVars)
  	TFcharacter <- lapply(dat[,keyVarInd,drop=FALSE],class)%in%"character"
  	if(any(TFcharacter)){
    	for(kvi in which(TFcharacter)){
      		dat[,keyVarInd[kvi]] <- as.factor(dat[,keyVarInd[kvi]]) 
    	}
  	}
	
	obj <- set.compObj(obj, type="compVars1", input=list(keyVarInd))
	obj <- set.compObj(obj, type="manipKeyVars", input=list(dat[,keyVarInd,drop=FALSE]))

  #### STOPPED HERE
  
	if ( !is.null(pramVars) ) {
		pramVarInd <- standardizeInput(obj, pramVars)
		obj <- set.compObj(obj, type="pramVars", input=list(pramVarInd))
		
		# variable only consists of NA values?
		all.na <- which(sapply(obj@origData[,pramVars], function(x) { all(is.na(x))}))
		if (  length(all.na) > 0 ) {
			warning('at least one pramVar only contains NA values! --> we do not use this variable!\n')
			obj <- set.compObj(obj, type="pramVars", list(get.compObj(obj, type="pramVars")[-all.na]))
			pramVarInd <- pramVarInd[-all.na]			
		}
		pramData <- dat[,pramVarInd,drop=FALSE]			
		obj <- set.compObj(obj, type="manipPramVars", input=list(dat[,pramVarInd,drop=FALSE]))
	}
	# numeric-variables
	if ( !is.null(numVars) ) {
		numVarInd <- standardizeInput(obj, numVars)
		obj <- set.compObj(obj, type="numVars", input=list(numVarInd))
		obj <- set.compObj(obj, type="manipNumVars", input=list(dat[,numVarInd,drop=FALSE]))
	}
	# weight-variable
	if ( !is.null(weightVar) ) {
		weightVarInd <- standardizeInput(obj, weightVar)
		obj <- set.compObj(obj, type="weightVar", input=list(weightVarInd))
	}	
	# hhId-variable
	if ( !is.null(hhId) ) {
		hhIdInd <- standardizeInput(obj, hhId)
		obj <- set.compObj(obj, type="hhId", input=list(hhIdInd))
	}	
	# hhId-variable
	if ( !is.null(strataVar) ) {
		strataVarInd <- standardizeInput(obj, strataVar)
		obj <- set.compObj(obj, type="strataVar", input=list(strataVarInd))
	}		
	# sensible-variable
	if ( !is.null(sensibleVar) ) {
		sensibleVarInd <- standardizeInput(obj, sensibleVar)
		obj <- set.compObj(obj, type="sensibleVar", input=list(sensibleVarInd))
	}
	if ( !is.null(options) ) {
		obj <- set.compObj(obj, type="options", input=list(options))
	}

	obj <- measure_risk(obj)
  	obj@originalRisk <- obj@risk
  
  	if ( length(numVars)>0 ) {
    	obj <- dRisk(obj)
    	#obj <- dRiskRMD(obj)	
		obj <- dUtility(obj)
  	}
	obj
}
computeNumberPrev <- function(obj){
  tmpo <- obj
  for(i in 1:1000){
    tmpo <- tmpo@prev
    if(is.null(tmpo))
      return(i-1)
  }
}
deletePrevSave <- function(obj,m){
  nprev <- computeNumberPrev(obj)
  if(m>=1&&m<=nprev){
    cmd <- paste("obj@",paste(rep("prev",m),collapse="@"),"<-NULL",sep="")
    eval(parse(text=cmd))
  }
  return(obj)
}
setGeneric('nextSdcObj', function(obj) {standardGeneric('nextSdcObj')})
setMethod(f='nextSdcObj', signature=c('compObj'),
    definition=function(obj) {
      options <- get.compObj(obj, type="options")
      if(('noUndo' %in% options))
        return(obj)
      if(nrow(obj@origData)>100000){
        warning("No previous states are saved because your data set has more than 100 000 observations.")
        return(obj)
      }
      if(length(grep("maxUndo",options))>0)
        maxUndo <- as.numeric(substr(options[grep("maxUndo",options)],9,stop=nchar(options[grep("maxUndo",options)])))
      else
        maxUndo <- 1
      obj <- deletePrevSave(obj,maxUndo)
      obj <- set.compObj(obj, type="prev", input=list(obj))
      return(obj) 
    })

setGeneric('calcRisks', function(obj, ...) {standardGeneric('calcRisks')})
setMethod(f='calcRisks', signature=c('compObj'),
    definition=function(obj, ...) { 
      risk <- get.compObj(obj, type="risk")
      modelSet <- (!is.null(risk$model))
      suda2Set <- (!is.null(risk$suda2))
      obj <- measure_risk(obj)
      if(modelSet) {
        inclProb <- NULL
        if(!is.null(risk$model$inclProb)) {
          inclProb <- risk$model$inclProb
        }
        
        obj <- LLmodGlobalRisk(obj, inclProb=inclProb)
      }
      if(suda2Set) {
        obj <- suda2(obj)
      }
	  if(length(get.compObj(obj, type="manipNumVars"))>0){
		obj <- dRisk(obj)
	  }
      obj
    })


setGeneric('extractManipData', function(obj,ignoreKeyVars=FALSE,ignorePramVars=FALSE,ignoreNumVars=FALSE,
        ignoreStrataVar=FALSE) {standardGeneric('extractManipData')})
setMethod(f='extractManipData', signature=c('compObj'),
    definition=function(obj,ignoreKeyVars=FALSE,ignorePramVars=FALSE,ignoreNumVars=FALSE,
        ignoreStrataVar=FALSE) { 
	o <- obj@origData
   	k <- obj@manipKeyVars
	p <- obj@manipPramVars
   	n <- obj@manipNumVars
   	s <- obj@manipStrataVar
   	if(!is.null(k)&&!ignoreKeyVars)
   		o[,colnames(k)] <- k
	if(!is.null(p)&&!ignorePramVars)
		o[,colnames(p)] <- p	
   	if(!is.null(n)&&!ignoreNumVars)
     	o[,colnames(n)] <- n
   	if(!is.null(s)&&!ignoreStrataVar)
   		o$sdcGUI_strataVar <- s
  ## quick and dirty: ensure that 
  ## keyVars are factors:
	if(!is.null(k)&&!ignoreKeyVars){
  for(i in 1:length(colnames(k))){
    o[, colnames(k)[i]] <- as.factor(o[, colnames(k)[i]])
  }
	}
  	return(o)
})
###
#library(comp4)
#data(francdat)
#sdcObj <- createSdcObj(dat=francdat, keyVars=c("Key1","Key2","Key3","Key4"), numVars=c(1,3,7), weightVar=8)
#sdcObj <- freqCalc4(sdcObj)
#sdcObj <- indivRisk4(sdcObj, method="approx", qual=1, survey=TRUE)
#comp4:::calc.compObj(sdcObj, type="violateKAnon", k=2)
#sdcObj <- addNoise4(sdcObj)
