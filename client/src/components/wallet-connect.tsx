import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Wallet, LogOut, Copy, ExternalLink, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
      isMetaMask?: boolean;
    };
  }
}

const MANTLE_MAINNET = {
  chainId: "0x1388",
  chainName: "Mantle",
  nativeCurrency: {
    name: "MNT",
    symbol: "MNT",
    decimals: 18,
  },
  rpcUrls: ["https://rpc.mantle.xyz"],
  blockExplorerUrls: ["https://explorer.mantle.xyz"],
};

const MANTLE_TESTNET = {
  chainId: "0x138b",
  chainName: "Mantle Sepolia Testnet",
  nativeCurrency: {
    name: "MNT",
    symbol: "MNT",
    decimals: 18,
  },
  rpcUrls: ["https://rpc.sepolia.mantle.xyz"],
  blockExplorerUrls: ["https://explorer.sepolia.mantle.xyz"],
};

export function WalletConnect() {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [chainId, setChainId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          }) as string[];
          if (accounts.length > 0) {
            setAddress(accounts[0]);
            const currentChainId = await window.ethereum.request({
              method: "eth_chainId",
            }) as string;
            setChainId(currentChainId);
          }
        } catch (error) {
          console.error("Error checking connection:", error);
        }
      }
    };

    checkConnection();

    if (window.ethereum) {
      const handleAccountsChanged = (accounts: unknown) => {
        const accountsArray = accounts as string[];
        if (accountsArray.length === 0) {
          setAddress(null);
        } else {
          setAddress(accountsArray[0]);
        }
      };

      const handleChainChanged = (newChainId: unknown) => {
        setChainId(newChainId as string);
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum?.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast({
        title: "MetaMask not found",
        description: "Please install MetaMask to connect your wallet.",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      }) as string[];
      
      if (accounts.length > 0) {
        setAddress(accounts[0]);
        
        const currentChainId = await window.ethereum.request({
          method: "eth_chainId",
        }) as string;
        setChainId(currentChainId);

        toast({
          title: "Wallet connected",
          description: `Connected to ${shortenAddress(accounts[0])}`,
        });
      }
    } catch (error: unknown) {
      const err = error as { code?: number; message?: string };
      if (err.code === 4001) {
        toast({
          title: "Connection rejected",
          description: "You rejected the connection request.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Connection failed",
          description: "Failed to connect wallet. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAddress(null);
    setChainId(null);
    toast({
      title: "Wallet disconnected",
      description: "Your wallet has been disconnected.",
    });
  };

  const switchToMantle = async (testnet = false) => {
    if (!window.ethereum) return;

    const network = testnet ? MANTLE_TESTNET : MANTLE_MAINNET;
    
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: network.chainId }],
      });
      toast({
        title: "Network switched",
        description: `Switched to ${network.chainName}`,
      });
    } catch (switchError: unknown) {
      const err = switchError as { code?: number };
      if (err.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [network],
          });
          toast({
            title: "Network added",
            description: `${network.chainName} has been added to your wallet`,
          });
        } catch {
          toast({
            title: "Failed to add network",
            description: "Could not add Mantle network to your wallet.",
            variant: "destructive",
          });
        }
      }
    }
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast({
        title: "Address copied",
        description: "Wallet address copied to clipboard.",
      });
    }
  };

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const isOnMantle = chainId === MANTLE_MAINNET.chainId || chainId === MANTLE_TESTNET.chainId;

  if (!address) {
    return (
      <Button
        onClick={connectWallet}
        disabled={isConnecting}
        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        data-testid="button-connect-wallet"
      >
        <Wallet className="mr-2 h-4 w-4" />
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2" data-testid="button-wallet-menu">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isOnMantle ? "bg-emerald-500" : "bg-amber-500"}`} />
            <span className="font-mono text-sm">{shortenAddress(address)}</span>
          </div>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">Connected Wallet</p>
          <p className="text-xs text-muted-foreground font-mono">{shortenAddress(address)}</p>
        </div>
        <DropdownMenuSeparator />
        {!isOnMantle && (
          <>
            <DropdownMenuItem onClick={() => switchToMantle(false)} data-testid="menu-switch-mantle">
              <ExternalLink className="mr-2 h-4 w-4" />
              Switch to Mantle
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => switchToMantle(true)} data-testid="menu-switch-mantle-testnet">
              <ExternalLink className="mr-2 h-4 w-4" />
              Switch to Mantle Testnet
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        {isOnMantle && (
          <div className="px-2 py-1.5">
            <Badge variant="secondary" className="risk-bg-low text-emerald-500">
              {chainId === MANTLE_TESTNET.chainId ? "Mantle Testnet" : "Mantle Mainnet"}
            </Badge>
          </div>
        )}
        <DropdownMenuItem onClick={copyAddress} data-testid="menu-copy-address">
          <Copy className="mr-2 h-4 w-4" />
          Copy Address
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={disconnectWallet} className="text-red-500" data-testid="menu-disconnect">
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
