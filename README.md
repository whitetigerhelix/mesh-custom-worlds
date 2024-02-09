# mesh-custom-worlds
Mesh custom worlds and other implementations using the public Mesh Toolkit

## Note on use of some internal packages
This project uses the public toolkit, but will leverage, build on, and contribute to some internal packages not available in the public toolkit.  

### To update internal packages
- Locate the source packages: **com.microsoft.mesh.interactables.internal** and **com.microsoft.mesh.playermodule.internal**
- Update the **package.json** dependencies section removing itemized toolkit packages and replacing with a single dependency on **com.microsoft.mesh.toolkit.preview**
- In the source package location, run this command in powershell: `npm pack`
- Copy the new tgz into this project's Packages folder
