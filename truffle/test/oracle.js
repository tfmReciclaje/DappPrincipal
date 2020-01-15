const CustomOracle = artifacts.require("CustomOracle.sol");
const { waitForEvent } = require('./utils')

let instance;

beforeEach(async () => {
    instance = await CustomOracle.deployed();
});

contract("CustomOracle", accounts => {
	
  const accountAdmin = accounts[0];
  const accountNoAdmin = accounts[1];
  const msgAdmin = "AdminRole: caller does not have the Admin role";
  const msgPause = "Pausable: paused";
  const msgBalance = "msg.value is not enough to cover for the query fee";

  /**
   *  LLama a la función que devuelve los puntos asignados por cada uno de los envases.
   *
   *  Se valida que:
   *  - Todos tienen el valor inicial 1
   */
  it("1. Comprueba valores iniciales de los puntos por envase", async () => {
  
    const values = await instance.getPointsPerPack.call();

    assert.equal(values[0], 1, "PACKl: El número de puntos por envase no es correcto");
	  assert.equal(values[1], 1, "PACK2: El número de puntos por envase no es correcto");
	  assert.equal(values[2], 1, "PACK3: El número de puntos por envase no es correcto");
  });

  /**
   *  Llama a la función que obtiene todos los valores correspondiente a un envase y que intervienen en el cálculo de puntos
   *
   *  Se valida que:
   *  - Todos los valores utilizados para el cálculo se puntos son inicializados correctamente
   *  - 
   */
  it("2. Comprueba los valores iniciales para el cálculo de puntos por envase", async () => {

    const values1 = await instance.getValuesPerPack.call(0);
    const values2 = await instance.getValuesPerPack.call(1);
    const values3 = await instance.getValuesPerPack.call(2);

    assert.equal(values1[0], 1, "PACK1: El número de puntos por envase no es correcto");
    assert.equal(values1[1], 1, "PACK1: El número de puntos mínimos por envase no es correcto");
    assert.equal(values1[2], 1, "PACK1: El número de puntos máximos por envase no es correcto");
	  assert.equal(values1[3], 0, "PACK1: El precio mínimo por envase no es correcto");
	  assert.equal(values1[4], 0, "PACK1: El precio máximo por envase no es correcto");

    assert.equal(values2[0], 1, "PACK2: El número de puntos por envase no es correcto");
    assert.equal(values2[1], 1, "PACK2: El número de puntos mínimos por envase no es correcto");
    assert.equal(values2[2], 1, "PACK2: El número de puntos máximos por envase no es correcto");
	  assert.equal(values2[3], 0, "PACK2: El precio mínimo por envase no es correcto");
	  assert.equal(values2[4], 0, "PACK2: El precio máximo por envase no es correcto");	

    assert.equal(values3[0], 1, "PACK3: El número de puntos por envase no es correcto");
    assert.equal(values3[1], 1, "PACK3: El número de puntos mínimos por envase no es correcto");
    assert.equal(values3[2], 1, "PACK3: El número de puntos máximos por envase no es correcto");
	  assert.equal(values3[3], 0, "PACK3: El precio mínimo por envase no es correcto");
	  assert.equal(values3[4], 0, "PACK3: El precio máximo por envase no es correcto");	
  });

  /**
   *  Llama a la función que actualiza los valores que intervienen en el cálculo de puntos para todos los tipos de envases
   *
   *  Se valida que:
   *  - Todos los valores utilizados para el cálculo se puntos son actualizados correctamente
   */
  it("3. Comprueba la actualización de los valores de puntos por envase se realiza correctamente", async () => {
  
    let ptosMin1  = 4;
    let ptosMax1  = 8;
    let ptosMin2  = 6;
    let ptosMax2  = 12;
    let ptosMin3  = 5;
    let ptosMax3  = 10;
    
    let priceMinPet = 3000000;
    let priceMaxPet = 4000000;
    let priceMinAlu = 15000000;
    let priceMaxAlu = 17000000;
	
    await instance.setPointsPackaging(ptosMin1, ptosMax1, ptosMin2, ptosMax2, 
                                      ptosMin3, ptosMax3, priceMinPet, priceMaxPet, 
                                      priceMinAlu, priceMaxAlu, { from: accountAdmin });

    const values1 = await instance.getValuesPerPack.call(0);
    const values2 = await instance.getValuesPerPack.call(1);
    const values3 = await instance.getValuesPerPack.call(2);

    assert.equal(values1[0], ptosMin1, "PACK1: El número de puntos por envase no es correcto");
    assert.equal(values1[1], ptosMin1, "PACK1: El número de puntos mínimos por envase no es correcto");
    assert.equal(values1[2], ptosMax1, "PACK1: El número de puntos máximos por envase no es correcto");
	  assert.equal(values1[3], priceMinPet, "PACK1: El precio mínimo por envase no es correcto");
	  assert.equal(values1[4], priceMaxPet, "PACK1: El precio máximo por envase no es correcto");

    assert.equal(values2[0], ptosMin2, "PACK2: El número de puntos por envase no es correcto");
    assert.equal(values2[1], ptosMin2, "PACK2: El número de puntos mínimos por envase no es correcto");
    assert.equal(values2[2], ptosMax2, "PACK2: El número de puntos máximos por envase no es correcto");
	  assert.equal(values2[3], priceMinPet, "PACK2: El precio mínimo por envase no es correcto");
	  assert.equal(values2[4], priceMaxPet, "PACK2: El precio máximo por envase no es correcto");	

    assert.equal(values3[0], ptosMin3, "PACK3: El número de puntos por envase no es correcto");
    assert.equal(values3[1], ptosMin3, "PACK3: El número de puntos mínimos por envase no es correcto");
    assert.equal(values3[2], ptosMax3, "PACK3: El número de puntos máximos por envase no es correcto");
	  assert.equal(values3[3], priceMinAlu, "PACK3: El precio mínimo por envase no es correcto");
	  assert.equal(values3[4], priceMaxAlu, "PACK3: El precio máximo por envase no es correcto");	
  });
  
  /**
   *  Repetimos el paso anterior pero con un usuario que no sea Admin
   *
   *  Se valida que:
   *  - Los valores para el cálculo se puntos solo pueden ser actualizados por un usuario Admin
   *  - 
   */
  it("4. Valida que los valores de puntos por envase solo puede ser actualizado por un usuario Admin", async () => {

	  let ptosMin1  = 7;
	  let ptosMax1  = 7;
	  let ptosMin2  = 7;
	  let ptosMax2  = 7;
	  let ptosMin3  = 7;
	  let ptosMax3  = 7;
	
	  let priceMinPet = 7000000;
	  let priceMaxPet = 7000000;
	  let priceMinAlu = 7000000;
	  let priceMaxAlu = 7000000;
	  
    try {
      await instance.setPointsPackaging(ptosMin1, ptosMax1, ptosMin2, ptosMax2, 
                                        ptosMin3, ptosMax3, priceMinPet, priceMaxPet, 
                                        priceMinAlu, priceMaxAlu, { from: accountNoAdmin });
      assert.fail("La transacción se ha podido realizar");
    } catch (error) {
      assert.equal(error.reason, msgAdmin, "Se ha producido otro tipo de error");
    } 									  
  });	  

  /**
   *  Llama a la función que cálcula el total de puntos según la cantidad de envases entregados
   *
   *  Se valida que:
   *  - El total de puntos es calculado correctamente
   */
  it("5. Comprueba el cálculo del total de puntos a entregar al usuario por reciclar", async () => {

	  let pack1 = 2;
	  let pack2 = 5;
	  let pack3 = 1;
	  let totalOk = 43; // (2 x 4 pts) + (5 x 6 pts) + (1 x 5 pts)
	
    let value = await instance.calculatePoints.call(pack1, pack2, pack3);
	
	  assert.equal(value, totalOk, "El número total de puntos a entregar no es correcto");

  });

  /**
   *  Llama a la función que devuelve otros parámetros utilizados en la gestión del oráculo (bloques y limites gas)
   *
   *  Se valida que:
   *  - Los valores de los otros parámetros utilizados en el oráculo son inicializados correctamente
   *  - 
   */
  it("6. Comprueba los valores iniciales de otros parámetros utilizados por el oráculo", async () => {
	  
	  let blocksPeriod = 40000;
	  let blocksRequest = 6000;	  
    let gasLimitLow = 150000;
	  let gasLimitMed = 200000;
	  let gasLimitHigh = 380000;	

    const values = await instance.getOtherValues.call();

    assert.equal(values[0], blocksPeriod, "El número de bloques por período no es correcto");
    assert.equal(values[1], blocksRequest, "El número de bloques entre peticiones no es correcto");
    assert.equal(values[2], gasLimitLow, "El valor del límite bajo de gas es correcto");
	  assert.equal(values[3], gasLimitMed, "El valor del límite medio de gas es correcto");
	  assert.equal(values[4], gasLimitHigh, "El valor del límite alto de gas es correcto");
  });

  /**
   *  Llama a la función que actualiza los otros parámetros utilizados en la gestión del oráculo (bloques y limites gas)
   *  para luego comprobar que los valores han sido actualizados correctamente
   *
   *  Se valida que:
   *  - Los valores de los otros parámetros utilizados en el oráculo son actualizados correctamente
   *  - 
   */
  it("7. Comprueba la correcta actualización de los otros parámetros utilizados por el oráculo", async () => {
	  
	  let blocksPeriod = 1;
	  let blocksRequest = 1;	  
    let gasLimitLow = 152000;
	  let gasLimitMed = 210000;
	  let gasLimitHigh = 400000;	

    await instance.setOtherValues(blocksPeriod, blocksRequest, gasLimitLow, gasLimitMed, gasLimitHigh, { from: accountAdmin });
	
    const values = await instance.getOtherValues.call();

    assert.equal(values[0], blocksPeriod, "El número de bloques por período no es correcto");
    assert.equal(values[1], blocksRequest, "El número de bloques entre peticiones no es correcto");
    assert.equal(values[2], gasLimitLow, "El valor del límite bajo de gas es correcto");
	  assert.equal(values[3], gasLimitMed, "El valor del límite medio de gas es correcto");
	  assert.equal(values[4], gasLimitHigh, "El valor del límite alto de gas es correcto");	
  });
	  
  /**
   *  Repetimos el paso anterior pero con un usuario que no sea Admin
   *
   *  Se valida que:
   *  - Los valores de los otros parámetros utilizados en el oráculo solo pueden ser actualizados por un usuario Admin
   *  - 
   */
  it("8. Verifica que los otros parámetros solo pueden ser actualizado por un usuario Admin", async () => {

	  let blocksPeriod = 2;
	  let blocksRequest = 2;	  
    let gasLimitLow = 170000;
	  let gasLimitMed = 220000;
	  let gasLimitHigh = 450000;
	  
    try {
	    await instance.setOtherValues(blocksPeriod, blocksRequest, gasLimitLow, gasLimitMed, gasLimitHigh, { from: accountNoAdmin });
      assert.fail("La transacción se ha podido realizar");
    } catch (error) {
      assert.equal(error.reason, msgAdmin, "Se ha producido otro tipo de error");
    } 									  
  });

  /**
   *  Validación tratamiento intervalo de precios del Ether
   * 
   *  Se valida que:
   *  - Los precios mínimo y máximo son actualizados correctamente
   */  
  it("9. Comprueba la correcta actualización del intervalo de precios del Ether", async () => {

    let priceMin = 1200000;
    let priceMax = 1700000;

    await instance.setRangeEthPrice(priceMin, priceMax, {from: accountAdmin});

    let values = await instance.getEthValues.call();

    assert.equal(values[0], priceMin, "El precio mínimo del Ether no se actualizó correctamente.");
    assert.equal(values[1], priceMax, "El precio máximo del Ether no se actualizó correctamente.");
  });    

  /**
   *  Validación tratamiento intervalo de precios del Ether
   * 
   *  Se valida que:
   *  - Los precios no pueden ser actualizados por una cuenta no Admin
   */  
  it("10. Valida que los de precios del Ether solo puedan ser actualizados por una cuenta Admin", async () => {

    let priceMin = 2000000;
    let priceMax = 3000000;

    try {
	    await instance.setRangeEthPrice(priceMin, priceMin, {from: accountNoAdmin});
      assert.fail("La transacción se ha podido realizar");
    } catch (error) {
      assert.equal(error.reason, msgAdmin, "Se ha producido otro tipo de error");
    }

  }); 

  /**
   *  Se valida si una cuenta es Admin
   * 
   *  Se valida que:
   *  - Una cuenta sea Admin
   *  - Una cuenta sea no Admin
   *  - Se añade una cuenta como Admin y se genera un evento AdminAdded
   *  - La cuenta no Admin previa ahora es Admin
   */  
  it("11. Se valida el alta y correcto tratamiento de una cuenta Admin", async () => {
	  
	  let result1 = await instance.isAdmin.call(accountAdmin);  
	  let result2 = await instance.isAdmin.call(accounts[2]);  
	  let result3 = await instance.addAdmin(accounts[2], {from: accountAdmin});
	  let result4 = await instance.isAdmin.call(accounts[2]); 

	  assert.isTrue(result1, "La cuenta no es Admin");
      assert.isFalse(result2, "La cuenta es Admin");
	  assert.equal(result3.logs[0].event, "AdminAdded", "No se generó evento AdminAdded");	
      assert.isTrue(result4, "La cuenta es No Admin");	
  });

  /**
   *  Se valida si una cuenta no Admin puede añadir a otra como Admin
   * 
   *  Se valida que:
   *  - Una cuenta no Admin no puede convertir otra en Admin   
   */  
  it("12. Comprueba el alta de una cuenta como Admin por otra cuenta no Admin", async () => {

    try {
      let result = await instance.addAdmin(accounts[3], {from: accountNoAdmin});
      assert.fail("La transacción se ha podido realizar");
    } catch (error) {
      assert.equal(error.reason, msgAdmin, "Se ha producido otro tipo de error");
    } 
  });  

  /**
   *  Se realiza una transferencia de 7 tokens a una nueva cuenta
   * 
   *  Se valida que:
   *  - Se ejecuta el evento newUser
   *  - Se ejecuta el evento newBalance
   *  - Se ejecuta el evento coinSent
   *  - Que los valores enviados en el evento cointSent coinciden con los de la transferencia
   */  
  // it("Generación de eventos", async () => {
  
  //   let cuenta = accounts[2];
  //   let code = "PRUEBA3";
  //   let fee = "";
  //   let qty = 7;
  //   let uni = "UNI";

  //   let result = await instance.sendCoin(code, fee, qty, uni, { from: cuenta });

  //   assert.equal(result.logs[0].event, "newUser", "No se generó evento newUser");
  //   assert.equal(result.logs[1].event, "newBalance", "No se generó evento newBalance");
  //   assert.equal(result.logs[2].event, "coinSent", "No se generó evento coinSent");

  //   let mvtFields = result.logs[2].args;

  //   assert.equal(mvtFields._code, code, "Campo code evento coinSent no es válido");
  //   assert.equal(mvtFields._fee, fee, "Campo fee evento coinSent no es válido");
  //   assert.equal(mvtFields._qty, qty, "Campo qty evento coinSent no es válido");
  //   assert.equal(mvtFields._uni, uni, "Campo uni evento coinSent no es válido");
  //   assert.equal(mvtFields._amount, qty, "Campo amount evento coinSent no es válido");
  // });

  /**
   *  Activa y desactiva los estados que implementan el "circuit breaker" del oráculo
   * 
   *  Se valida:
   *  - El estado del oráculo tras ejecutar la acciones de Pause/Unpause
   *  - Se emiten los eventos correspondientes
   */
  it("13. Activar y desactivar la pausa (circuit breaker) del oráculo", async () => {
    
    let result1 = await instance.pause({from: accountAdmin});
    let isPaused = await instance.paused.call();
    
    let result2 = await instance.unpause({from: accountAdmin});
    let isUnpaused = await instance.paused.call();

    assert.isTrue(isPaused, "No se activó la pausa correctamente");
    assert.isFalse(isUnpaused, "No se activó la pausa correctamente");
    assert.equal(result1.logs[0].event, "Paused", "No se generó evento Paused()");
    assert.equal(result2.logs[0].event, "Unpaused", "No se generó evento Unpaused()");
  });

 /**
   *  Activación de la pausa por un contrato no Admin
   * 
   *  Se valida:
   *  - El estado del oráculo tras ejecutar la acciones de Pause/Unpause
   *  - Se emiten los eventos correspondientes
   */
  it("14. Comprueba la activación de la pausa del oráculo (circuit breaker) con una cuenta no Admin", async () => {
    
    try {
      let result = await instance.pause({from: accountNoAdmin});
      assert.fail("La transacción se ha podido realizar");
    } catch (error) {
      assert.equal(error.reason, msgAdmin, "Se ha producido otro tipo de error");
    } 
  });

  /**
   *  Test de funciones para manejar el saldo en Ethers del contrato
   * 
   *  Para ello:
   *  - Se traspasan weis al contrato
   *  - Se consulta el saldo  
   *  - Se traspasan los weis al owner
   * 
   *  Se valida que el saldo inicial y final son iguales, mientras que el intermedio
   *  es superior
   */
  it("15. Se valida el correcto funcionamiento al enviar y recibir Ethers", async () => {

    let incBalance = 20000000000;

    const contractBalance1 = await instance.getContractBalance.call();
    const newBalance1 = contractBalance1 / 1e10;

    let result1 = await instance.setFunds("Envío de fondos", {
      from: accountAdmin,
      value: incBalance
    });
 
    const contractBalance2 = await instance.getContractBalance.call();
    const newBalance2 = contractBalance2 / 1e10;

    let result2 = await instance.transfer(incBalance, {
      from: accountAdmin,
    });

    const contractBalance3 = await instance.getContractBalance.call();
    const newBalance3 = contractBalance3 / 1e10;

    assert.equal(newBalance1, newBalance3, "El saldo inicial y final son distintos");
    assert.isTrue((newBalance2 > newBalance3), "Se descontó el saldo correctamente");

  });

  /**
   *  Test de funciones para manejar el saldo en Ethers del contrato
   * 
   *  Se valida:
   *  - Un "tranfer" no puede ser hecho por una cuenta no Admin
   */
  it("16. Se Comprueba el transfer de Ethers por una cuenta no Admin", async () => {  

    let incBalance = 20000000000;    

    try {
      let receipt = await instance.transfer(incBalance, {from: accountNoAdmin});
      assert.fail("La transacción se ha podido realizar");
    } catch (error) {
      assert.equal(error.reason, msgAdmin, "Se ha producido otro tipo de error");
    } 

  });    

  /**
   *  Se detiene el contrato (Pause) para activar el "circuit breaker" y se valida
   *  que no se pueden realizarse transacciones
   */
  it("17. Se detiene el contrato (Pause) y se intenta actualizar datos", async () => {

    let result = await instance.pause({
      from: accountAdmin
    });
    const isPaused = await instance.paused.call();

    assert.isTrue(isPaused, "No se activó la pausa correctamente");
    assert.equal(result.logs[0].event, "Paused", "No se generó evento Paused()");

    let priceMin = 2000000;
    let priceMax = 3000000;

    try {
	    await instance.setRangeEthPrice(priceMin, priceMin, {from: accountAdmin});
      assert.fail("La transacción se ha podido realizar");
    } catch (error) {
      assert.equal(error.reason, msgPause, "Se ha producido otro tipo de error");
    } 

  }); 

  /**
   *  Con el contrato detenido (Pause) se intenta lanzar el proceso de 
   *  actualización de punto
   */
  it("18. Comprueba la actualización de los puntos con el contrato detenido (Pause)", async () => {

    try {
      let receipt = await instance.nextProcess({from: accountAdmin});
      assert.fail("La transacción se ha podido realizar");
    } catch (error) {
      assert.equal(error.reason, msgPause, "Se ha producido otro tipo de error");
    } 

  });

  /**
   *  Se valida si una cuenta no Admin puede quitar el Pause del contrato
   */
  it("19. Verifica que una cuenta no Admin no puede quitar el Pause del contrato", async () => {

    try {
      await instance.unpause({from: accountNoAdmin});
      assert.fail("La transacción se ha podido realizar");
    } catch (error) {
      assert.equal(error.reason, msgAdmin, "Se ha producido otro tipo de error");
    }  

  });  

  /**
   *  Se valida no se puede solicitar un nuevo número aleatorio con el contrato en pause
   */
  it("20. Comprueba que no se pueda solicitar un número aleatorio con el contrato en Pause", async () => {

    let min = 100;
    let max = 200;
    let credit = 1;
    
    try {
      await instance.newRandomRequest(min, max, {from: accountAdmin, value:credit});
      assert.fail("La transacción se ha podido realizar");
    } catch (error) {
      assert.equal(error.reason, msgPause, "Se ha producido otro tipo de error");
    }  

  });
  
  /**
   *  Se valida no se puede solicitar la fecha del día con el contrato en Pause
   */
  it("21. Comprueba que no se puede solicitar la fecha del día con el contrato en Pause", async () => {

    let credit = 1;
    
    try {
      await instance.getCurrentDateTime({from: accountAdmin, value:credit});
      assert.fail("La transacción se ha podido realizar");
    } catch (error) {
      assert.equal(error.reason, msgPause, "Se ha producido otro tipo de error");
    }  

  });  

  /**
   *  Se valida se puede solicitar un número aleatorio tras quitar el Pause
   */
  it("22. Verifica se pueda solicitar un número aleatorio tras quitar el Pause", async () => {

    let min = 100;
    let max = 200;
    let credit = 1e18;

    let result1 = await instance.unpause({from: accountAdmin});

    try {
      let result = await instance.newRandomRequest(min, max, {from: accountAdmin, value:credit});
	  assert.equal(result.logs[0].event, "LogNewProvableQuery", "No se generó evento LogNewProvableQuery()");
    } catch (error) {
      console.log("Error3: ", error);
      assert.fail("La transacción no se ha podido realizar");
    } 
  }); 	


  /**
   *  Se valida se puede solicitar la fecha del día tras quitar el Pause
   */
  it("23. Verifica se pueda solicitar la fecha del día tras quitar el Pause", async () => {

    let credit = 1e18;

    try {
      let result = await instance.getCurrentDateTime({from: accountAdmin, value:credit});
	  assert.equal(result.logs[0].event, "LogNewProvableQuery", "No se generó evento LogNewProvableQuery()");
    } catch (error) {
      console.log("Error4: ", error);
      assert.fail("La transacción no se ha podido realizar");
    } 
  });

  /**
   *  Se valida se puede solicitar el recalculo de puntos tras quitar el Pause
   */
  it("24. Verifica se pueda solicitar el recalculo de puntos tras quitar el Pause", async () => {

	let incBalance = 1e18;
	
	await instance.setFunds("Envío de fondos", {from: accountAdmin, value: incBalance});

    try {
      let result = await instance.nextProcess({from: accountAdmin});
	  assert.equal(result.logs[0].event, "LogNewProvableQuery", "No se generó evento LogNewProvableQuery()");
    } catch (error) {
      console.log("Error5: ", error);
      assert.fail("La transacción no se ha podido realizar");
    } 
  });


  /**
   *  Se valida no se puede solicitar un número aleatorio sin saldo suficiente (msg.value)
   */
  it("25. Comprueba no se pueda solicitar un número aleatorio sin saldo suficiente", async () => {

    let min = 100;
    let max = 200;
    let credit = 1;

    try {
		let result = await instance.newRandomRequest(min, max, {from: accountAdmin, value:credit});
		assert.fail("La transacción se ha podido realizar");
    } catch (error) {
		console.log("Error32: ", error);
		assert.equal(error.reason, msgBalance, "Se ha producido otro tipo de error");
    } 
  }); 	


  /**
   *  Se valida no se puede solicitar la fecha del día sin saldo suficiente (msg.value)
   */
  it("26. Comprueba no se pueda solicitar la fecha del día sin saldo suficiente", async () => {

    let credit = 1;

    try {
		let result = await instance.getCurrentDateTime({from: accountAdmin, value:credit});
		assert.fail("La transacción se ha podido realizar");
    } catch (error) {
		console.log("Error42: ", error);
		assert.equal(error.reason, msgBalance, "Se ha producido otro tipo de error");
    } 
  });

  /**
   *  Se valida solo puede solicitar un número aleatorio un cuenta admin
   */
  it("27. Valida que solo una cuenta admin pueda solicitar un número aleatorio", async () => {

    let min = 100;
    let max = 200;
    let credit = 1e18;

    try {
		let result = await instance.newRandomRequest(min, max, {from: accountNoAdmin, value:credit});
		assert.fail("La transacción se ha podido realizar");
    } catch (error) {
		console.log("Error32: ", error);
		assert.equal(error.reason, msgAdmin, "Se ha producido otro tipo de error");
    } 
  }); 	


  /**
   *  Se valida solo puede solicitar la fecha del día un cuenta admin
   */
  it("28. Valida que solo un cuenta admin pueda solicitar la fecha del día", async () => {

    let credit = 1;

    try {
		let result = await instance.getCurrentDateTime({from: accountNoAdmin, value:credit});
		assert.fail("La transacción se ha podido realizar");
    } catch (error) {
		console.log("Error42: ", error);
		assert.equal(error.reason, msgAdmin, "Se ha producido otro tipo de error");
    } 
  });
  
  /**
   *  Valida el valor devuelto por la query de numero aleatorio
   */
  it("29. Comrpueba el valor devuelto por la query de numero aleatorio", async () => {
	  
	  let value = await instance.randomNumber.call();

	  assert(value >= 100 && value <= 200, "Número aleatorio no válido");
  });	  
  
  /**
   *  Valida el valor devuelto por la query de fecha del día
   */
  it("30. Comprueba el valor devuelto por la query de fecha del día", async () => {
	  
	  let value = await instance.dateTime.call();
	  
	  assert.isAbove(value.length, 0, "Fecha y hora no válida");	  
  });  
  
  /**
   *  Valida los valores devueltos por el recalculo de puntos
   */
  it("31. Comprueba que los puntos por envase han sido recalculados", async () => {

	  let prevValue = 15;

	  let values = await instance.getPointsPerPack.call();
	  let value = values.reduce((a, b) => a + b, 0);
	  
	  assert.notEqual(value, prevValue, "Los puntos por envase no se han actualizado");
  });  
	  

/*

    console.log("Seguimos...");

    const {
      blockNumber,
      returnValues: {
        myAddress,
        randomNumber
      }
    } = await waitForEvent(events.generatedRandomNumber);
  
    console.log("blockNumber: ", blockNumber);
    console.log("Return values: ", returnValues); 
    console.log("Result2: ", result2);


checkNextProcess

Actualización de puntos (al menos uno de los tres ha cambiado)

contador queries pendientes ??

newRandomRequest ??

getCurrentDateTime ??

 assert.isAbove(delay, 0, 'Delay should be > 0 for this test!')

*/  


/*
it(`Should have set off a recursive query upon contract creation`, async () => {
  hashBefore = await methods.nextRecursiveQuery().call()

  const {
    blockNumber,
    returnValues: {
      myAddress,
      randomNumber
    }
  } = await waitForEvent("generatedRandomNumber")

  console.log("blockNumber: ", blockNumber);
  console.log("Return values: ", returnValues);

  /** 
  const timestamp  = await methods.getLastUpdated().call()
  const lAfterCont = await methods.getSafeLowPrice().call()
  const sAfterCont = await methods.getStandardPrice().call()
  const fAfterCont = await methods.getFastPrice().call()
  conversionFactor = await methods.conversionFactor().call()
  blockNum         = blockNumber
  time             = timestamp
  qID              = queryID
  lAfter           = lAfterCont
  sAfter           = sAfterCont
  fAfter           = fAfterCont
  assert.equal(safeLowPrice * conversionFactor, lAfterCont, `Safe low price not logged in event correctly!`)
  assert.equal(standardPrice * conversionFactor, sAfterCont, `Safe low price not logged in event correctly!`)
  assert.equal(fastPrice * conversionFactor, fAfterCont, `Safe low price not logged in event correctly!`)
  
}) **/


});