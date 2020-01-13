pragma solidity ^0.5.1;

import "./lib/AdminRole.sol";
import "./lib/MngrRole.sol";
import "./lib/PausableMngr.sol";
import "./Main.sol";

import "./lib/SafeMath.sol";

contract Associated_FC is PausableMngr, AdminRole {

    using SafeMath for uint;

    event Generate(address indexed container_address, bytes32 indexed hashName, uint256 points);

	// Variables Globales
    uint generatedPoints; // Puntos generados en el contenedor
    uint exchangedItems;  // Items generados
	uint exchangedPoints; // Puntos canjeados por descuentos desde el asociado
    uint clearedPoints;   // Puntos Liquidados por Ecoembes, en caso que se diera
    uint pack1; // Número de items de tipo 1
	uint pack2; // Número de items de tipo 2
	uint pack3; // Número de items de tipo 3

    bool status;	                // Estado del Asociado
	bytes32 hashAssociatedName;     // hash del nombe del asociado
	uint counterContainer;          // Contador de Contenedores

    Main main;// Referencia del contrato principal, para conocer su Address

    mapping (address => Container) public listContainers; //Lista de contenedores por Asociado
    address[] internal containerList;
    address internal associatedAddress; //Dirección de la cuenta administradora del asociado


   constructor (bytes32 _hashAssociatedName, address _associatedAddress ) public payable {

       main= Main(msg.sender);  // Dirección del contrato Principal

	   hashAssociatedName = _hashAssociatedName;// Nombre del Asociado Hasheado
       associatedAddress = _associatedAddress;
       addAdmin(_associatedAddress); //Añadimos la cuenta del asociado como administradora del contrato       
    }



     /**
     * @dev Recupera la información de los puntos Generados, canjeados y La cantidad de Elementos reciclados.
     *
     * @return _generatedPoints  Cantidad Puntos Generados
     * @return _exchangedPoints  Cantidad Puntos Canjeados
     * @return  _exchangedItems  Cantidad de Elementos Reciclados
     * @return _clearedPoints    Cantidad Puntos canjeados por Asociado
     * @return _pack1     Cantidad envases tipo pack1
     * @return _pack2     Cantidad envases tipo pack2
     * @return _pack3     Cantidad envases tipo pack3
     *
     **/
    function getAssociatedInfo() public view returns (uint _generatedPoints, uint _exchangedPoints, uint _exchangedItems, uint _clearedPoints, uint _pack1, uint _pack2, uint _pack3) {
		return (generatedPoints, exchangedPoints, exchangedItems, clearedPoints, pack1, pack2, pack3 );
	}


    /**
     * @dev Actualiza los puntos generados del asociado.
     *
     * @param _points  Cantidad Puntos Generados
     **/
    function updateGeneratedPoints(uint _points) internal  {
		generatedPoints += _points;
	}
    

    /**
     * @dev Actualiza el número de Elementos reciclados en Total.
     *
     * @param _items Elementos reciclados.
     **/
    function updateExchangeItems(uint _items) internal  {
		exchangedItems += _items;
	}


    /**
     * @dev Actualiza el número de Elementos reciclados por tipo.
     *
     * @param _pack1  Elementos de Tipo 1
     * @param _pack2  Elementos de Tipo 2
     * @param _pack3  Elementos de Tipo 3
     **/
    function updateRecycItems(uint _pack1, uint _pack2, uint _pack3) internal  {
		pack1 += _pack1;
        pack2 += _pack2;
        pack3 += _pack3;
	}


    /**
    * @dev Añadir Contenedor al asociado, sólo ejecutable por Admin
    * @param _nameRef   Identificador Referencia del contenedor.
    * @param _container_address Address Ethereum del contenedor, parámetro que vendria desde el Frontend
    * 
    */
	function addContainer(bytes32 _nameRef, address _container_address) public onlyAdmin whenNotPaused  (){

		//_nameRef y container address no pueden estar vacias a la hora de crear contenerdor.
	    require(
            bytes32(_nameRef).length > 0 && _container_address != address(0), "Container Name and Address should be fill!");

        //El address del contenedor ya esta en la lista
        require(!(listContainers[_container_address].seqId > 0), "Address already exist!");
        require((listContainers[_container_address].nameRef != _nameRef), "nameRef already exist!");

		counterContainer++;

        //Inicializa el Contenedor y se añade al ArrayList
        listContainers[_container_address] = Container(counterContainer, _nameRef, 0, 0, 0, 0, 0, 0, 0, now, now, true, associatedAddress);
        containerList.push(_container_address);
	}

    /**
    * @dev Devuelve la lista de Contenedores para un asociado
	* @return ArrayList
	*/
    function getContainerList() public view returns (address[] memory) {
		return containerList;
	}

    /**
    * @dev  Canjear Puntos de un Usuario, La App de Canjear Puntos llamará a esta funcion desde la Applicación
    * @param _userHashcode  Hash del Usuario
    * @param _hashedSecret  Hash palabra secreta del usuario
    * @param _amount  Cantidad de Puntos 
    * @return boolean  Ejecución ok/nok
	*/
	function exchangePoints(bytes32 _userHashcode, bytes32 _hashedSecret, uint _amount ) public onlyAdmin whenNotPaused returns (bool){

        bool result = main.exchangePoints(hashAssociatedName, _userHashcode, _amount, _hashedSecret); //El contrato es quien llama al exchange del principal. Esto permite aislar mejor las operaciones del asociado conj las operaciones del contrato principal
        if (result){

            exchangedPoints = exchangedPoints.add(_amount);
            return true;
        }
        return false;
    }



    /**
    * @dev  Asociado puede canjear Puntos con Entidad central
    * @param _amount  Cantidad de Puntos
    * @return boolean  Ejecución ok/nok
	*/
    function clearPoints(uint _amount ) public onlyMngr whenNotPaused returns (bool){

        exchangedPoints = exchangedPoints.sub(_amount, "clearPoints: transfer amount exceeds balance");
        clearedPoints = clearedPoints.add(_amount);

        return true;
    }


    /**
    * @dev  Obtener Balance del Usuario
    * @param _userHashcode  Hash del Usuario
    * @return Balance
	*/
    function getUserBalance( bytes32 _userHashcode) public view returns (uint256) {
		 return main.balanceOf(_userHashcode);
	}


	//----------------------------------------------------------------------------------------------------
    //-----------------------------------    CONTENEDOR   ------------------------------------------------
    //----------------------------------------------------------------------------------------------------

    //Modelo de Datos de un Contenedor
    struct Container {
        uint seqId;
		bytes32 nameRef;
        uint insideItems;
        uint exchangedItems;
        uint generatedPoints;
        uint txCount;
        uint pack1;
        uint pack2;
        uint pack3;
        uint startDate;
        uint stateDate;
        bool isEnable;
        address associated;

	}

    // Modificador para saber si un Contenedor esta Activo
    modifier onlyContainerEnable() {
        require(listContainers[msg.sender].startDate > 0, "The sender is not a valid container");
        require(listContainers[msg.sender].isEnable, "The sender is not a container enable");
        _;
    }


    /**
      * @dev Asignación de Puntos al usuario que ha reciclado y actualización de Puntos en Asociado
      *
      * @param _hashUserName  Hash del nombre del Usuario
      * @param _hashedSecret  Hash de la palabra secreta del usuario
      * @param _pack1  Elementos de Tipo 1
      * @param _pack2  Elementos de Tipo 2 
      * @param _pack3  Elementos de Tipo 3
      */
    function packagingCollection(bytes32 _hashUserName,  bytes32 _hashedSecret, uint _pack1, uint _pack2, uint _pack3)
    public onlyContainerEnable whenNotPaused returns (bool){

        
        uint points;
        uint ammount = _pack1 + _pack2 + _pack3;

        require (ammount > 0, "Number of items is not greater than zero");        

        listContainers[msg.sender].txCount += 1;
        listContainers[msg.sender].insideItems = listContainers[msg.sender].insideItems.add(ammount);
        listContainers[msg.sender].exchangedItems = listContainers[msg.sender].exchangedItems.add(ammount);

        //Actualiza los diferentes tipos de elementos reciclados
        listContainers[msg.sender].pack1 = listContainers[msg.sender].pack1.add(_pack1);
        listContainers[msg.sender].pack2 = listContainers[msg.sender].pack2.add(_pack2);
        listContainers[msg.sender].pack3 = listContainers[msg.sender].pack3.add(_pack3);

        updateRecycItems(_pack1, _pack2, _pack3);
        updateExchangeItems(_pack1 + _pack2 + _pack3);

        //Cálculo de Puntos
        points = main.calculatePoints(_pack1, _pack2, _pack3);

        
        //Actualiza Puntos del Usuario:
        bool result = main.updateUserBalance(hashAssociatedName, _hashUserName, points, _hashedSecret);
		if (result){
            listContainers[msg.sender].generatedPoints += points;
            updateGeneratedPoints(points);

            emit Generate(msg.sender, _hashUserName, points);

            return true;
        }else {
             return false;
        }

    }

    /**
     * @dev Saber si el contenedor esta activo
     *
     * @param _container  Address del Contenedor
     */  
    function isEnableContainer(address _container) public view returns (bool) {
        require(_container != address(0), "Container address is not valid");
        
        return listContainers[_container].isEnable;
    }


    /**
     * @dev Activar el contenedor
     *
     * @param _container  Address del Contenedor
     */ 
    function enableContainer(address _container) public onlyAdmin whenNotPaused {
        
        require (!(listContainers[_container].isEnable), "Container already enable");

        listContainers[_container].stateDate = now;
        listContainers[_container].isEnable = true;
    }

    /**
     * @dev Desactivar el contenedor
     *
     * @param _container  Address del Contenedor
     */ 
    function disableContainer(address _container) public onlyAdmin whenNotPaused {
        require (listContainers[_container].isEnable, "Container is not enable");
        listContainers[_container].stateDate = now;
        listContainers[_container].isEnable = false;
    }

    /**
     * @dev Añadir Bolsa de Reciclaje completa de residuos para su monitorización
     *
     * @return _hashAssociatedName  Hash del nombre del Asociado
     * @return _QR  QR de la bolsa Reciclada
     * @return  _associated   Dirección Ethereum del Asociado
     * @return _nameRef    Nombre de Referencia del Contenedor
     * @return _pack1     Cantidad envases tipo pack1
     * @return _pack2     Cantidad envases tipo pack2
     * @return _pack3     Cantidad envases tipo pack3
     *
     **/

     function addRecycledBag(bytes32 _hashAssociatedName, bytes32 _QR, address _associated, bytes32 _nameRef,  uint _pack1, uint _pack2, uint _pack3 ) onlyContainerEnable public returns (bool) {     

         bool result = main.addRecicledBag(hashAssociatedName, _QR, _associated, _nameRef, _pack1, _pack2, _pack3);
		if (result){
            // Actualiza las latas que se han introducido en el contenedor del asociado  y inicializa valores del contenedos          
            updateRecycItems(listContainers[msg.sender].pack1, listContainers[msg.sender].pack2, listContainers[msg.sender].pack3);
            
            //Inicializa el contenedor a 0
            listContainers[msg.sender].pack1 = 0;
            listContainers[msg.sender].pack2 = 0;
            listContainers[msg.sender].pack3 = 0;
            listContainers[msg.sender].insideItems = 0;

            return true;

        }else {
             return false;
        }

     }


}