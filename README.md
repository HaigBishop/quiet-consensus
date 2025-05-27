# quiet-consensus




## Assignment

https://hackmd.io/@darwinzero/r1xyCW_xxg

https://learn.canterbury.ac.nz/mod/assign/view.php?id=4187466





## Secret Network

https://scrt.network/

https://docs.scrt.network/secret-network-documentation

https://github.com/scrtlabs/secret-toolkit




## To do
 - Plan project
 - Understand secret-auction (Tut May 14)
 - Understand secret-auction-monorepo (Tut May 21)




## Non-Transferable Soulbound Credentials
NTSCs (non-transferable soulbound credentials) are NFTs that represent badges of membership to a real world group of people. At their core they represent:
 - Proof-of-humanity (you know it’s a real person)
 - Group membership (you belong to “that” community)
 - Immutable one-per-person (you can’t duplicate or trade it)

If an account has an NTSC that means the account belongs to an individual in the group of humans that the NTSC represents. NTSCs are issued by an off-chain organisation called an "issuing organisation".

The off-chain issuing organisation has access to the on-chain NTSC admin account which gives them exclusive rights to issue NTSCs. This issuing process looks like:
1) The individual meets with the issuing organisation and confirms their human identity and that they belong to a particular group.
2) The issuing organisation confirms that an NTSC has not already been issued to this individual yet by checking their private off-chain records.
3) The individual provides their on-chain account address, and the issuing organisation mints an NTSC to that account. 
4) The issuing organisation erases the address provided, but records the fact that this individual has been issued an NTSC.

Once an NTSC is minted, it cannot be transfered, burned or mutated.

Therefore, if we trust:
 - The issuing organisations ability to correctly issue NTSCs
 - That the individuals address was entered without a mistake
 - The indivdual doesn't lose or give away access to their account

Then we can guarantee that if an account has an NTSC, that account is controlled by an individual belonging to the group of humans that the NTSC represents.

We can also guarantee that each individual belonging to the group of humans that the NTSC represents has access to a maximum of 1 account that possesses an NTSC.

## Anonymous Consensus Polling
...

