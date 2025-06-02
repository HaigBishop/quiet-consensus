# Quiet Consensus

## Other Pages
- [README.md](../README.md)
- [Quiet Consensus](./qui-con.md)
- [Architecture](./architecture.md)

## Overview
Quiet Consensus is an online opinion polling site which uses the secret network blockchain to hold the state of polls. Users can view the newest or trending polls on topics of interest while knowing that each vote belongs to a real human being from a particular group of people, and that no single human being could make more than one vote on each poll.


## Philosophy of Quiet Consensus
Quiet Consensus attempts to solve two issues seen in the realm of sharing opinions on the internet.

Social pressure influences people voicing their views. 

- Employees do not voice their disagreement with a boss’s poor idea to avoid being the odd one out.
- Someone with a differing opinion leaves a community rather than expressing disagreement openly.
- Social media users quietly agree with a post, but won’t "like" or comment on it due to it being perceived as controversial and for fear of backlash.
- Public polls show near-unanimity, but anonymous surveys later reveal widespread disagreement, demonstrating how social visibility alters expressed opinions.

Sharing of opinions online can often easily be artificially amplified or faked with bot accounts.

- Online polling is often plagued with bots giving a false impression of consensus.
- Trending topics can be artificially amplified by coordinated fake accounts, misleading genuine users into believing there is widespread agreement.
- It is challenging to verify whether online opinions represent real human consensus or automated manipulation.

Quiet Consensus addresses these issues through **anonymous voting paired with cryptographic soulbound proof-of-humanity credentials**, ensuring genuine, fearless representation of each individual's voice.

### Core Principles
- **One vote, one person**
   Soulbound credentials prove humanity and group membership.
- **Anonymous, pressure-free**
   Polls run over a secret network so opinions stay private, even as we enforce one-vote-only.
- **Collective wisdom, not biggest wallet**
   Decisions reflect the true centre of gravity in the room, not the loudest voice.
- **Transparent mechanics**
   Open-source, auditable code ensures you can verify the process without sacrificing privacy.


## Soulbound Credential Tokens
SCTs (soulbound credential tokens) are NFTs that represent badges of membership to a real world group of people. At their core they represent:
 - Proof-of-humanity (you know it’s a real person)
 - Group membership (you belong to “that” community)
 - Immutable one-per-person (you can’t duplicate or trade it)

If an account has an SCT that means the account belongs to an individual in the group of humans that the SCT represents. SCTs are issued by an off-chain organisation called an "issuing organisation".

The off-chain issuing organisation has access to the on-chain SCT admin account which gives them exclusive rights to issue SCTs. This issuing process looks like:
1) The individual meets with the issuing organisation and confirms their human identity and that they belong to a particular group.
2) The issuing organisation confirms that an SCT has not already been issued to this individual yet by checking their private off-chain records.
3) The individual provides their on-chain account address, and the issuing organisation mints an SCT to that account. 
4) The issuing organisation erases the address provided, but records the fact that this individual has been issued an SCT.

Once an SCT is minted, it cannot be transferred, burned or mutated.

Therefore, if we trust:
 - The issuing organisation's ability to correctly issue SCTs
 - That the individual's address was entered without a mistake
 - The individual doesn't lose or give away access to their account

Then we can guarantee that if an account has an SCT, that account is controlled by an individual belonging to the group of humans that the SCT represents.

We can also guarantee that each individual belonging to the group of humans that the SCT represents has access to a maximum of 1 account that possesses an SCT.


## Anonymous Consensus Polling
Any individual can create a poll, but only individuals with SCTs can vote on polls. The act of voting is anonymous (thanks to the secret network), but since it requires an SCT we can be sure that each vote represents the opinion of a single individual verified to belong to the group that the SCT represents.


## Example Use-case
An example use-case of Quiet Consensus is the scientific community. It is common for scientists to keep opinions private due to public pressure. Quiet Consensus enables the scientific community to openly explore controversial or emerging topics without fear of professional repercussions or bias. This is possible because votes are anonymous, yet verifiable.





