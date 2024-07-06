// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ISFrax {
    function deposit(uint256 _assets, address _receiver) external returns (uint256 _shares);

    function transfer(address to, uint256 value) external returns (bool);

    function allowance(address spender, address owner) external view returns (uint256);

    function approve(address spender, uint256 amount) external returns (bool);

    function asset() external view returns (address);

    function balanceOf(address) external view returns (uint256);

    function convertToAssets(uint256 shares) external view returns (uint256);

    function convertToShares(uint256 assets) external view returns (uint256);

    function decimals() external view returns (uint8);
}
