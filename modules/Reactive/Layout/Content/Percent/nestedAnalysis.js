export async function PercentNestedAnalysis(data) {
  try {
    const dataform = await NXUI.ref.get(data.store, data.id);
console.log(data)
    const allowed = dataform.percent.variables;
    const filteredData = {
      ...dataform.formSDK,
      variables: dataform.formSDK.variables.filter((v) => allowed.includes(v)),
    };
    console.log(filteredData)
    // ambil response dulu
    const response = await NXUI.Storage()
      .models("Office")
      .nestedAnalysisProgres(filteredData);
      console.log(response)
    // baru mapping ke result
    // const result = response.data.response.map(({ label, total }) => ({
    //   label,
    //   total,
    // }));

    return response.data.response;
  } catch (error) {
    return []; // Return empty array as fallback
  }
}
// nestedAnalysisProgres
// crossJoinAnalysisProgres