## package installation

```R
install_bitbucket("comp", username="matthias-da",  auth_user="yourBitbucketUserName", password="deinpasswd")
```


## data import facilities

use data import facilities from sdcMicroGUI. This is written partly with Gtk2 but the basics principle should be copied from the sdcMicroGUI
package

```R
library(sdcMicroGUI)
sdcGUI()
```

For the class structure, have a look at the sdcMicro package. Maybe I can help here, but I'm very busy this month.
A certain class structure will help for GUI development.
Each slot of the defined class should include information about the data.

```R
library(sdcMicro)
```
