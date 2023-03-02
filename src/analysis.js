const { getTrips,getDriver } = require('api'); 

async function analysis() { 

  let result = await getTrips();


    const resultCopy = result.map(x => x);

    let isCashBilledAmount = 0,
        nonCashBilledAmount = 0,
        noOfisCashTrips = 0,
        noOfNonCashTrips = 0;
    let uniqueDriverIDs = [];
    for (tripData of resultCopy) {
        if (!uniqueDriverIDs.includes(tripData.driverID)) {
            uniqueDriverIDs.push(tripData.driverID);

        }
        if (tripData.isCash) {
            isCashBilledAmount += parseFloat(String(tripData.billedAmount).replace(/,/g, ''));
            noOfisCashTrips += 1
        }

       
        if (!tripData.isCash) {
            nonCashBilledAmount += parseFloat(String(tripData.billedAmount).replace(/,/g, ''))
            noOfNonCashTrips += 1
        }
    }
    
    let driversInfo = [];
    let individualDriverTrips = [];
        
    
    let individualTripsArr = [];
    let individualTripsObj = {};
    for (drivers of uniqueDriverIDs) {
        driversInfo.push(getDriver(drivers));
       
        const driverIndividualTrips = resultCopy.filter(data => {
                if (data.driverID == drivers) {
                    return data
                }
            })
            
        individualTripsObj.driverID = drivers;
        individualTripsObj.noOfTrips = driverIndividualTrips.length;
        individualTripsArr.push(individualTripsObj);
        individualTripsObj = {};

       
        individualDriverTrips.push(driverIndividualTrips);
    }

    
    const noOfDriversWithMoreThanOneVehicles = (await Promise.allSettled(driversInfo)).filter(data => {

       
        if (data.status === "fulfilled" && (data.value).vehicleID.length > 1) {
            return data;
        }
    }).length;
    
    const mostEarnedSort = individualDriverTrips.sort((a, b) => {
        return (b.reduce((acc, cur) => {
            return acc + parseFloat(String(cur.billedAmount).replace(/,/g, ''))
        }, 0) - a.reduce((acc, cur) => {
            return acc + parseFloat(String(cur.billedAmount).replace(/,/g, ''))
        }, 0))
    })
    let driverIndividualEarnings = {};
    let driverIndividualEarningsArr = [];
   
    for (driver of mostEarnedSort) {
       
        const tripEarnings = driver.reduce((acc, cur) => {
            return acc + parseFloat(String(cur.billedAmount).replace(/,/g, ''))
        }, 0)

        driverIndividualEarnings.driverID = `${driver[0].driverID}`;
        driverIndividualEarnings.totalEarning = `${tripEarnings}`
        driverIndividualEarningsArr.push(driverIndividualEarnings)
        driverIndividualEarnings = {}
    }
    individualTripsArr.sort((a, b) => {
            return b.noOfTrips - a.noOfTrips
        })
       
    const value = individualTripsArr[0].noOfTrips;
    const driverWithMostTrips = individualTripsArr.filter((element => {
        if (element.noOfTrips === value) {
            return element
        }
    }))
    const driverWithMostTripsID = driverWithMostTrips[0].driverID;
    const driverWithMostTripsNoOfTrips = driverWithMostTrips[0].noOfTrips;
    const driverWithMostTripsTotalEarning = driverIndividualEarningsArr.filter((element) => {
        if (element.driverID === driverWithMostTripsID) {
            return element
        }
    })
    const driverWithMostTripsInitDetails = await getDriver(driverWithMostTripsID);
    const driverWithMostTripsFinalDetails = {
        "name": driverWithMostTripsInitDetails.name,
        "email": driverWithMostTripsInitDetails.email,
        "phone": driverWithMostTripsInitDetails.phone,
        "noOfTrips": driverWithMostTripsNoOfTrips,
        "totalAmountEarned": Number(driverWithMostTripsTotalEarning[0].totalEarning)
    };

    
    const driverWithMostEarningsID = driverIndividualEarningsArr[0].driverID
    const driverWithMostEarningsTotalEarning = driverIndividualEarningsArr[0].totalEarning
    const hisInitDetails = await getDriver(driverWithMostEarningsID);
    const hisTotalTrips = individualTripsArr.filter((element) => {
        if (element.driverID === driverWithMostEarningsID) {
            return element
        }
    })
    const highestEarningDriverFinalDetails = {
        "name": hisInitDetails.name,
        "email": hisInitDetails.email,
        "phone": hisInitDetails.phone,
        "noOfTrips": hisTotalTrips[0].noOfTrips,
        "totalAmountEarned": Number(driverWithMostEarningsTotalEarning)
    };


    const finalOutput = {
        "noOfCashTrips": noOfisCashTrips,
        "noOfNonCashTrips": noOfNonCashTrips,
        "billedTotal": isCashBilledAmount + nonCashBilledAmount,
        "cashBilledTotal": isCashBilledAmount,
        "nonCashBilledTotal": Number(nonCashBilledAmount.toFixed(2)),
        "noOfDriversWithMoreThanOneVehicle": noOfDriversWithMoreThanOneVehicles,
        "mostTripsByDriver": driverWithMostTripsFinalDetails,
        "highestEarningDriver": highestEarningDriverFinalDetails
    }
    return finalOutput;
  


//   let objArr ={
//                 "noOfCashTrips": 0,
//                 "noOfNonCashTrips":0,
//                 "billedTotal":0,
//                 "cashBilledTotal": 0,
//                 "nonCashBilledTotal":0,
//                 "noOfDriversWithMoreThanOneVehicle":0,
//                 "mostTripsByDriver": {
//                   "name": "",
//                   "email": "",
//                   "phone": "", 
//                   "noOfTrips": 0,
//                   "totalAmountEarned": 0
//                 },
//                 "highestEarningDriver": {
//                   "name": "",
//                   "email": "",
//                   "phone": "",
//                   "noOfTrips": 0,
//                   "totalAmountEarned": 0
//                 }
//   }
//   var numTrip ={};
//   var tempMaxTrip;
//   var maxTrip=0;
//   var drivesId =[];
//   var uniqueId = {};
//   var uniIdArr = [];
//   var drivers;
//   var maxEarningDriver =0
//   var tempEarningDriver;
//   try{
//   var response = await getTrips();
//   for(let element of response){

//     objArr["noOfCashTrips"] += [element].filter(x=>x.isCash).length
//     objArr["noOfNonCashTrips"] += [element].filter(x=>!x.isCash).length
//     objArr["billedTotal"]+= [element].reduce((total,value)=>{return total + parseFloat(String(value.billedAmount).replace(/,/g,""))},0)
//     objArr["cashBilledTotal"]+= [element].filter(x=>x.isCash).reduce((total,value)=>{return total + parseFloat(String(value.billedAmount).replace(/,/g,""))},0)
//     objArr["nonCashBilledTotal"]+= [element].filter(x=>!x.isCash).reduce((total,value)=>{return total + parseFloat(String(value.billedAmount).replace(/,/g,""))},0)
    
   
//     if(!uniqueId[element.driverID]){

//         uniqueId[element.driverID] = parseFloat(String(element.billedAmount).replace(/,/g,""))
        
//         drivers = await getDriver(element.driverID);
        
//         drivesId.push(element.driverID) 
//         objArr["noOfDriversWithMoreThanOneVehicle"]+= (drivers.vehicleID.length >1 ? 1:0);
//         numTrip[element.driverID]=1

//     }else{

//         uniqueId[element.driverID] += parseFloat(String(element.billedAmount).replace(/,/g,""))
//         numTrip[element.driverID]++
//         tempMaxTrip = maxTrip
//         tempEarningDriver = maxEarningDriver
//         maxTrip = Math.max(tempMaxTrip,numTrip[element.driverID])
//         maxEarningDriver = Math.max(tempEarningDriver,uniqueId[element.driverID])
//     }
  
//   }
  
//   }catch(err){

//     console.log(err.message )
//   }
//   var maxId =[]
//   let first
//   var maxDriverId;
  
//   for(let keys in numTrip){
//     if(numTrip[keys]===maxTrip){
//       maxId.push(keys)
//     }
//     if(uniqueId[keys] === maxEarningDriver){
//       var maxEarningId = keys
//     }
//     if(maxEarningId === keys){
//       var noOfTrip = numTrip[keys]
//     }
//    [first] = maxId 
//   }
//   maxDriverId = await getDriver(first)
//   maxEarningDriverDetails = await getDriver(maxEarningId)
//   objArr["mostTripsByDriver"].name = maxDriverId.name
//   objArr["mostTripsByDriver"].email = maxDriverId.email
//   objArr["mostTripsByDriver"].phone = maxDriverId.phone
//   objArr["mostTripsByDriver"].noOfTrips = maxTrip;
//   objArr["highestEarningDriver"].name = maxEarningDriverDetails.name;
//   objArr["highestEarningDriver"].email = maxEarningDriverDetails.email;
//   objArr["highestEarningDriver"].phone = maxEarningDriverDetails.phone;
//   objArr["highestEarningDriver"].noOfTrips = noOfTrip;
//   objArr["highestEarningDriver"].totalAmountEarned = maxEarningDriver;
  
//   for(let element of response){
    
//     objArr["mostTripsByDriver"].totalAmountEarned += [element].filter(x => x.driverID == first).reduce((total,value)=>{return total + parseFloat(String(value.billedAmount).replace(/,/g,""))},0)
   
//   }

//  return objArr
  

}
analysis()
module.exports = analysis;




