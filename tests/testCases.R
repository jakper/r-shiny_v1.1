### create test data sets:

library(robCompositions)
data(expenditures)
x <- expenditures
n <- nrow(x)

setNA <- function(x, NArate=0.05){
  n <- nrow(x)
  for(i in 1:ncol(x)){
    x[sample(1:n, round(NArate*n)),i] <- NA 
  }
  x
}

setDL0 <- function(x, dl){
  n <- nrow(x)
  for(i in 1:ncol(x)){
    x[x[,i] < dl[i], i] <- 0
  }
  x
}

## low amount of missings:
x1 <- setNA(x)

## high amount of missings:
x2 <- setNA(x, 0.3)

## problems with missings:
x3 <- x4 <- x2
x3[2,] <- NA 
x4[,2] <- NA

## rounded zeros (saved as 0, later we onlz provide dl as an input!):
x5 <- setDL0(x, dl=c(1000,350,200,400,350))
x5 <- setNA(x5)

## one external variables:
x6 <- cbind("external1"= sample(30:50, n, replace=TRUE), x5)

## several external vars:
x7 <- cbind("external2"= factor(sample(30:50, n, replace=TRUE)), 
            "external3"= factor(sample(c("M","W"), n, replace=TRUE)),
            "external4"= sample(c(1,3), n, replace=TRUE),
            x6)
x7[1,1] <- NA

## coordinates:
x8 <- cbind("xcoo"=sample(30000:50000, n), "ycoo"=sample(30000:50000, n),x7)

## second part of compositions:
m <- apply(x, 2, mean)
v <- cov(x)
library(MASS)
M <- mvrnorm(n, mu=m, Sigma=v)
colnames(M) <- paste(colnames(M),"2",sep="")
x9 <- cbind(x8, M)

## missing values as other characters:
x10 <- x9
x10[is.na(x9)] <- "."

save(x1,x2,x3,x4,x5,x6,x7,x8,x9,x10, file="data/testdata.RData")
write.csv(x1, file="inst/doc/x1.csv")
write.csv(x2, file="inst/doc/x2.csv")
write.csv(x3, file="inst/doc/x3.csv")
write.csv(x4, file="inst/doc/x4.csv")
write.csv(x5, file="inst/doc/x5.csv")
write.csv(x6, file="inst/doc/x6.csv")
write.csv(x7, file="inst/doc/x7.csv")
write.csv(x8, file="inst/doc/x8.csv")
write.csv(x9, file="inst/doc/x9.csv")
write.csv(x10, file="inst/doc/x10.csv")


