import {createApp} from "./server.mjs";
const port=Number(process.env.PORT??3000);
createApp().listen(port,"0.0.0.0",()=>console.log("Tabbata review workspace ready on port "+port));
