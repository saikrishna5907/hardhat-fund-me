export type INetworkConfig = {
    name: string, ethUSDPriceFeedAddress: string, blockConfirmations?: number
}
export const NETWORK_CONFIG: Record<number, INetworkConfig> = {
    4 /* rinkeby chainID */: {
        name: 'rinkeby',
        ethUSDPriceFeedAddress: "0x8A753747A1Fa494EC906cE90E9f37563A8AF630e",
        blockConfirmations: 6
    },
    80001 /*polygon test net chain id*/: {
        name: 'polygon',
        ethUSDPriceFeedAddress: '0xF9680D99D6C9589e2a93a78A04A279e509205945',
        blockConfirmations: 6
    },
    137/* matic chainID */: {
        name: 'matic',
        ethUSDPriceFeedAddress: "0xF9680D99D6C9589e2a93a78A04A279e509205945"
    },
    11155111/*sepolia test net chain id*/: {
        name: 'sepolia',
        ethUSDPriceFeedAddress: '0x694AA1769357215DE4FAC081bf1f309aDC325306'
    }
}

export const DEVELOPMENT_CHAINS: number[] = [31337]
