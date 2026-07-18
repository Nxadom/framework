import { PercentNestedAnalysis } from "./nestedAnalysis.js";
import { PercentCrossJoinAnalysis } from "./crossJoinAnalysis.js";
export async  function initData(packageData) {

      // Try to get data from database if available
      const dataform = await NXUI.ref.get(packageData.store, packageData.id);
     console.log(dataform)
      let redData = {};
      if (dataform.type == "join") {
        redData = await PercentCrossJoinAnalysis(dataform);
      } else {
        redData = await PercentNestedAnalysis(dataform);
      }
console.log(redData)
      return redData
};
