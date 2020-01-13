pragma solidity ^0.5.1;

import "./lib/Context.sol";
import "./lib/Roles.sol";
import "./lib/TraceRole.sol";
import "./lib/Pausable.sol";
import "./Associated_FC.sol";
import "./CustomOracle.sol";

import "./lib/SafeMath.sol";


contract Main is Pausable, TracerRole {

	using SafeMath for uint;

	CustomOracle customOracle;// Referencia del contrato principal, para conocer su Address

    struct User {
		bytes32 hashName;
		uint index; //Indice para el control del alta de usuarios
		bytes32 hashedSecret; //Hash256 de la Palabra secreta del usuario.
		uint balance; //Puntos del usuario
	}

	struct Associated {
		bytes32 hashName;
		uint index; //Indice para el control del alta de asociados
		address contract_address; //Contrato del asociado
		address associated_address; //Dirección del asociado
		bool enable;
	}

	mapping (bytes32 => User) private _users;
    bytes32[] internal userList;

	mapping (bytes32 => Associated) private _associated;
	bytes32[] internal associatedList;

	//El contructor incluye la dirección del oráculo para acceder a sus métodos
	constructor(address payable customOracle_address) public {
		customOracle = CustomOracle(customOracle_address);
		//customOracle.addAdmin(address(this));
    }

    //----------------------------------------------------------------------------------------------------
    //------------------    ASSOCIATED    ----------------------------------------------------------------
    //----------------------------------------------------------------------------------------------------

	// Solo una cuenta con permisos de Administrador podrá añadir asociados al contrato.
    function addAssociated(bytes32 hashName, address _associated_address) public onlyAdmin whenNotPaused  {

        bytes32 hashAssociatedName = hashName;
        Associated_FC associated_contract = new Associated_FC(hashAssociatedName, _associated_address);
		Associated storage associated = _associated[hashName];
		associated_contract.addMngr(msg.sender); //Añadimos la cuenta propietaria como Maganer del contrato de asociado

		require(!(associated.index > 0), "Associated already exist!");

		associatedList.push(hashName);
		uint associatedListIndex = associatedList.length - 1;
		associated.index = associatedListIndex + 1;
		associated.hashName = hashName;
		associated.associated_address = _associated_address;
		associated.contract_address = address(associated_contract);
		associated.enable = true;

	}

	// Método para recuperar la lista de asociados por código hash
    function getAssociatedList() public view returns (bytes32[] memory) {
		return associatedList;
	}

	// Recupera el asociado con código hashName
    function getAssociated(bytes32 hashName ) public view returns (address contract_address, bool enable) {
        return (_associated[hashName].contract_address, _associated[hashName].enable);
    }

	// Método para comprobar si la dirección que se pasa como parámetro corresponde a la dirección de contrato de un asociado.
	function isAssociated(bytes32 hashName, address associated_contract_address) public view returns (bool) {
		return  _associated[hashName].contract_address == associated_contract_address;
	}

	// Método para desactivar un asociado con identificador hashName. Solo una cuenta con permisos de Admin pará ejecutar el método
	function disableAssociated(bytes32 hashName) public onlyAdmin whenNotPaused returns (bool) {

		require(_associated[hashName].enable, "Associated is already disabled.");
		_associated[hashName].enable = false;

		// El método modifica el estado del contrato del asociado en podo paused
		Associated_FC associated_contract;
		associated_contract = Associated_FC(_associated[hashName].contract_address);
		associated_contract.pause();

		return true;
	 }

	// Método para activar un asociado con identificador hashName. Solo una cuenta con permisos de Admin pará ejecutar el método
	function enableAssociated(bytes32 hashName) public onlyAdmin whenNotPaused returns (bool) {

		require(!_associated[hashName].enable, "Associated is already enabled.");
		_associated[hashName].enable = true;

		// El método modifica el estado del contrato del asociado en podo unpaused
		Associated_FC associated_contract;
		associated_contract = Associated_FC(_associated[hashName].contract_address);
		associated_contract.unpause();

		return true;
	}
	//----------------------------------------------------------------------------------------------------



	//----------------------------------------------------------------------------------------------------
    //------------------    USERS    ---------------------------------------------------------------------
    //----------------------------------------------------------------------------------------------------
    // Método para añadir un usuario. Se guarda un hashSecret como código hash256 de la palabra secreta incluida por el usuario
	function addUser(bytes32 hashName, bytes32 hashedSecret) internal whenNotPaused returns (bool){

		User storage user = _users[hashName];
		user.hashName = hashName;

		if(user.index > 0){ // No se añade el usuario si ya existe
			 return true;
		}else {
			 userList.push(hashName);
			 uint userListIndex = userList.length - 1;
			 user.index = userListIndex + 1;
			 user.hashedSecret = hashedSecret;
			 user.balance = 0;

			 return true;
		}
	}

	// Método para comproabr si existe el usuario con identificador hashName
	function isUser(bytes32 hashName) internal view returns (bool) {
		return _users[hashName].index > 0;
	}

	// Devuelve el balance del usuario con identificador hashName
	function balanceOf(bytes32 hashName) public view returns (uint256) {
         return _users[hashName].balance;
    }	

    // Método que actualiza el balance de puntos de un usuario. El método solo podrá invocarse desde el contrato de un asociado.
	function updateUserBalance(bytes32 hashAssociatedName, bytes32 hashName, uint generatedPoints, bytes32 hashedSecret)
	public whenNotPaused returns (bool){

		//customOracle.checkNextProcess();

	    require(isAssociated(hashAssociatedName,msg.sender), "Associated no exist."); //Solo pude llamarlo la dirección de Contrato del Asociado.
        require(_associated[hashAssociatedName].enable, "Associated is disabled."); // El asociado debe estar activado

		// Se llama al método addUser para comprobar si ya existe el usuario. En caso contrario se añade uno nuevo.
        addUser(hashName, hashedSecret); // name y word son opcionales. Solo son necesarios si el usuario no existe

		// Añadimos los puntos al usuario
		_users[hashName].balance = _users[hashName].balance.add(generatedPoints);

        return true;
    }

	//----------------------------------------------------------------------------------------------------


	//----------------------------------------------------------------------------------------------------
    //------------------    EXCHANGE   -------------------------------------------------------------------
    //----------------------------------------------------------------------------------------------------

	// Se recupera los puntos correspondientes a los envases pack_1, pack_2 y pack_3. El método se invoca cada vez que un usuario añade envases en el contenedor.
	// Este método es invocado desde el contrato del asociado para llevar la gestión de los puntos generados en el mismo
	function calculatePoints(uint _pack1, uint _pack2, uint _pack3) public view returns (uint) {
		return customOracle.calculatePoints(_pack1, _pack2, _pack3);
	}

	// Se comprueba que el usuario con el código hashSecret está dado de alta en el contrato
    function checkUser(bytes32 user_hashName, bytes32 hashedSecret) internal view returns (bool){

        require(isUser(user_hashName), "User doesn't exist");
        if (hashedSecret == _users[user_hashName].hashedSecret) {
            return true;
        }
        return false;
    }

    //Solo el contrato del asociado puede llamar al método exchange
    function exchangePoints(bytes32 hashAssociatedName, bytes32 user_hashName, uint amount, bytes32 hashedSecret) public whenNotPaused returns (bool){

        require(isAssociated(hashAssociatedName, msg.sender), "Associated doesn't exist."); //Solo pude llamarlo la Dirección de Asociado.
        require(_associated[hashAssociatedName].enable, "Associated is disabled."); // El asociado debe estar activado
        require(checkUser(user_hashName, hashedSecret),"User or Password incorrect.");

        _users[user_hashName].balance = _users[user_hashName].balance.sub(amount);

        return true;
    }


	//----------------------------------------------------------------------------------------------------
    //------------------ BAGS MANAGEMENT -----------------------------------------------------------------
    //----------------------------------------------------------------------------------------------------

	//Monitorizacion de las Bolsas que se han usado en los contenedores
	//Desde la app del contenedor por cada bolsa se genera un QR que se le pasa al usuario al final de meter las botellas
    //Identificación, Monitorización y Cambio de Estado de las bolsas de los contenedores

    mapping (bytes32 => QR_Bag) public listQR_Bags; //*  Lista de BOlsas con QRs en la Aplicación
    bytes32[] public _QRBagList;

	 //Modelo de Datos de una bolsa del Contenedor identificada con un QR que tendrá el usuario que recicle
    struct QR_Bag{
        bytes32 qr;
        address associated;
        bytes32 hashAssociatedName;
        bytes32 nameRef;//
        uint item_1;
        uint item_2;
        uint item_3;
        string status; //String o enum
        uint date;//no haria falta


    }

	//Solo el contrato del asociado puede llamar al método addRecicledBag, habria que meter modificador onlyAdmin
	/* 
      * @dev recycledBagQR : Desde el asociado se le pasa la info al Principal para que inicialize el estado
      * contrato Pricipal le asigna inicialemnet estado "STORED" 
      * @param _hashAssociatedName Hash del asociado
      * @param _QR Identificador que se le asigna a la bolsa
	  * @param _associated Address del container
	  * @param _nameRef Address del container
	  * @param _item_1 Item 1
	  * @param _item_2 Item 2
	  * @param _item_3 Item 3
      * 
      */ 
    function addRecicledBag(bytes32 _hashAssociatedName, bytes32 _QR, address _associated, bytes32 _nameRef,  uint _item_1, uint _item_2, uint _item_3 ) public whenNotPaused returns (bool){
        
		require(!(listQR_Bags[_QR].qr != ""), "QR ya utilizado!!");

		string memory _status = "STORED" ;//Estado inicial de la Bolsa, 

		//Añadir Bolsa al mapping
        listQR_Bags[_QR] = QR_Bag(_QR, _associated, _hashAssociatedName, _nameRef,  _item_1, _item_2, _item_3, _status, now);
		_QRBagList.push(_QR);

		return true;

        
    }


	 /* 
      * @dev getQRBagList :Devuelve la lista de bolsas QR para poder usar luego el mapping listQR_Bags y poder monitorizarlas
      * @return bytes32[] Array de QRs
      * 
      */ 
     function getQRBagList() public view returns (bytes32[] memory) {
		return _QRBagList;
	}

 	// Cambiar el estado de la bolsa TRansportistas
     function updatedQRBagTruck(bytes32 _QR) public onlyTracer   { //Solo puede llamarle las compañias de Basura
        require(listQR_Bags[_QR].qr != "", "QR erroneo!!");

        listQR_Bags[_QR].date = now;
		listQR_Bags[_QR].status = "IN_TRUCK";
	}


	// Cambiar el estado de la bolsa Fabricas Reciclado
     function updatedQRBagFacfory(bytes32 _QR) public onlyTracer   { //Solo puede llamarle las fabricas de reciclaje
        require(listQR_Bags[_QR].qr != "", "QR erroneo!!");

        listQR_Bags[_QR].date = now;
		listQR_Bags[_QR].status = "RECYCLED";
	}

}
