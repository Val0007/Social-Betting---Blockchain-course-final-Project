pragma solidity ^0.8.0;

import "./Prediction.sol";

contract PredictionFactory {
    address[]  deployedPredictions;
    mapping(address => address[])  predictionsByCreator;
        
    function createPrediction(string memory title, string[] memory options) public returns (address) {
        Prediction newPrediction = new Prediction(msg.sender, title, options);
        address predictionAddress = address(newPrediction);
        
        deployedPredictions.push(predictionAddress);
        predictionsByCreator[msg.sender].push(predictionAddress);
                
        return predictionAddress;
    }
    
    function getDeployedPredictions() public view returns (address[] memory) {
        return deployedPredictions;
    }
    
    function getPredictionsByCreator(address creator) public view returns (address[] memory) {
        return predictionsByCreator[creator];
    }
}