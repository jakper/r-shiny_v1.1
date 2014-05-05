### class compObj ###

setClassUnion('dataframeOrNULL', c('data.frame', 'NULL'))
setClassUnion('numericOrNULL', c('numeric', 'NULL'))
setClassUnion('characterOrNULL', c('character', 'NULL'))
setClassUnion('logicalOrNULL', c('logical', 'NULL'))
setClassUnion('matrixOrNULL', c('matrix', 'NULL'))
setClassUnion('listOrNULL', c('list', 'NULL'))
setClassUnion('factorOrNULL', c('factor', 'NULL'))
setClassUnion('compOrNULL', c('NULL'))

#' S4 class describing a comp-object
#'
#' This class models a data object containing ...
#'
#' \describe{
#' \item{slot \code{rawData}:}{... .. }
#' ...
#' }
#' @name compObj-class
#' @rdname compObj-class
#' @exportClass compObj
#' @note objects of class \code{dataObj} are input for slot \code{dataObj} in class \code{sdcProblem}
#' @author Matthias Templ \email{matthias.templ@@gmail.com}
setClass(
  Class='compObj', 
  representation=representation(			
    origData='dataframeOrNULL',
    compVars1='numericOrNULL',
    compVars2='numericOrNULL',
    compVars3='numericOrNULL',
    tranCompVars1='numericOrNULL',
    tranCompVars2='numericOrNULL',
    tranCompVars3='numericOrNULL',
    coordinates='numericOrNULL',
    external='numericOrNULL',
    subset='numericOrNULL'
  ),
  prototype=prototype(
    origData=NULL,
    compVars1=NULL,
    compVars2=NULL,
    compVars3=NULL,
    tranCompVars1=NULL,
    tranCompVars2=NULL,
    tranCompVars3=NULL,
    coordinates=NULL,
    external=NULL,
    subset=NULL
  ),
  validity=function(object) {	
    return(TRUE)
  }
)

setIs("compObj", "compOrNULL")