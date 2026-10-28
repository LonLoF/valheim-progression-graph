import { Page, Section, Input, Segmented, Legend, Text, Table, Callout, useGrokTheme, useState, useMemo, useRef, useEffect } from "grok/canvas";
import type { CSSProperties, ReactNode } from "grok/canvas";

const RAW = `Eikthyr|0|B|||||30*2|31,n::3|||2|
Boar|0|C||||||d,p,2z:15||4t,8a,bb,18,19,4r|1|
Crow|1|C||||||l:100:3|xRuins and camps in the Black Forest||2|
Deer|0|C||||||k::2,j::1–2,30:50|||1|
Deer White|1|C||||||k::2,tm:100:1|||2|Rare passive white deer, Black Forest 'forest monster' variant, 30 HP. Rare variant, spawn unconfirmed (no spawn table found).
Greyling|0|C||||||u|||1|
Neck|0|C||||||r:70,32:5|||1|
Piggy|0|C|||||||||1|
Seagull|0|C||||||l:100:3|xCoasts of the Meadows, Black Forest and Plains, and over the Ocean||2|Spawns over Meadows coasts, so it is reachable from the start (shoot it with a bow) → Meadows.
Amber|0|m|||||||f0123;v5;xMined from Stone graves / Viking graveyards (Meadows); fishing bonus from Perch||1|
Amber Pearl|0|m|||||||f012348;v10;xStone graves / Viking graveyards; fishing bonus from Pike||1|
Basic Fireworks|4|m|||||||th50@fc||2|
Beech Seeds|0|m|||||||gBeech||1|
Boar Meat|0|m|||||||||1|
Bronze Battle Idol|1|m|||||||f01||1|
Bronze Protection Idol|1|m|||||||f01||1|
Coins|0|m|||||||f012345678;xStone graves / Viking graveyards (Meadows)||2|Sources: creature drops (e.g. Troll 20–30, Fulings, Dvergr, Captive Fuling), chests in every biome, and selling valuables to any trader. Coin Pile is a build piece made from Coins, not a source. Spent at Haldor, Hildir and the Bog Witch.
Curious Axe Head|0|m|||||||f0||1|
Dandelion|0|m|||||||gDandelion||1|
Deer Hide|0|m|||||||f1;xDestroying Fuling village roofs (Plains)||2|
Deer Meat|0|m|||||||||1|
Feathers|0|m|||||||gBeech,Birch,Fir,Oak,Pine,Timber Tree;f012478;xProduced by the Birds' Nest (buildable piece)||1||aAlternative recipe · produced over time~uh~
Flint|0|m|||||||gFlint;f0;xTanning racks in Fuling villages (Plains)||2|
Hard Antler|0|m|||||||||2|
Iron Pit|1|m|||||||th75||2|
Leather Scraps|0|m|||||||gMuddy Scrap Pile;f01||2|
Mysterious Axe Head|0|m|||||||f0||1|
Neck Tail|0|m|||||||||1|
Queen Bee|0|m|||||||xBreak a wild beehive (abandoned houses, stone towers)||2|
Red Fireworks|4|m||3b|||b,19||||1|
Resin|0|m|||||||gBeech,Birch,Fir,Oak,Pine,Timber Tree||2|
Rock|0|m|||||||gRock||1|
Ruby|0|m|||||||f012348;v20;xFishing bonus from Tuna||1|
Silver Necklace|0|m|||||||gMeat Pile,Skeletal Remains;f0147;v30;xMountain graves, Frost Cave meat piles, buried chests, Stonehenge chests||1|
Stone|0|m|||||||gCopper Deposit,Copper vein,Flametal Ore,Iron vein,Petrified Gammeltroll,Rock;f1||2|
Wood|0|m|||||||gBranch,Ancient Tree,Beech,Birch,Fir,Oak;f1||2||xobliterator~a4
Wooden Battle Idol|0|m|||||||f0||1|
Wooden Protection Idol|0|m|||||||f0||1|
Yellow Fireworks|4|m||3b|||b,i||||1|
Perch|1|h|||||||b5q;xMeadows and Black Forest waters||2|
Cooked Boar Meat|0|f||38|||d||||1||aAlternative recipe~a2~d
Cooked Deer Meat|0|f||38|||k||||1||aAlternative recipe~a2~k
Grilled Neck Tail|0|f||38|||r||||1||aAlternative recipe~a2~r
Honey|0|f||35|||||||2|
Mushroom|0|f|||||||gMushroom||1|
Raspberries|0|f|||||||gRaspberries||1|
Hammer|0|t||H|||z*3,y*2||||1||u2~~z,y~;u3~~z*2,y*2~;p3~~10
Hoe|0|t||3b|||z*5,y*2||||1||u2~3b~z,y~2;u3~3b~z*2,y*2~3;p3~~10
Antler Pickaxe|0|w|2|3b|||z*10,n||||1|
Club|0|w|1|H|||z*6||||2||u2~~3v*5~;u3~~3v*10~;u4~~3v*20~;p4~~10,3v*22
Crude Bow|0|w|b|3b|||z*10,p*8||||1||u2~3b~z*5,p*4,j~2;u3~3b~z*10,p*8,j*2~3;u4~3b~z*20,p*16,j*4~4;p4~~10
Early Axes|0|w|2|3b|||z*4,h,q||||1||u2~3b~z*2,p*2~2;u3~3b~z*4,p*4~3;u4~3b~z*8,p*8~4;p4~~49
Flint Axe|0|w|1|3b|||z*4,m*6||||1||u2~3b~m*3,p*2~2;u3~3b~m*6,p*4~3;u4~3b~m*12,p*8~4;p4~~e
Flint Knife|0|w|1|3b|||z*2,m*4,p*2||||1||u2~3b~m*2~2;u3~3b~m*4~3;u4~3b~m*8~4;p4~~10
Flint Spear|0|w|1|3b|||z*5,m*10,p*2||||1||u2~3b~z*3,m*5,p~2;u3~3b~z*6,m*10,p*2~3;u4~3b~z*12,m*20,p*4~4;p4~~10
Sparkler|1|w|t||||||th150||2|
Stone Axe|0|w|1|H|||z*5,y*4||||1||u2~~y*2~;u3~~y*4~;u4~~y*8~;p4~~10
Torch|0|w|t|H|||z,u||f07||1|
Wooden Axe|0|w|1||||||f0||1|
Wooden Knife|0|w|1||||||f0||1|
Wooden Mace|0|w|1||||||f0||1|
Wood Shield|0|s||3b|||z*10,u*4,p*4||||1||u2~3b~z*5,u*2,p*2~2;u3~3b~z*10,u*4,p*4~3;p3~~11
Wood Tower Shield|0|s||3b|||z*10,p*6||||1||u2~3b~z*5,p*3~2;u3~3b~z*10,p*6~3;p3~~11
Fire Arrow|0|o||3b|2|20|z*8,u*8,l*2||f0||1||xobliterator~a4
Flinthead Arrow|0|o||3b|2|20|z*8,m*2,l*2||f01||1||xobliterator~a4
Wood Arrow|0|o||3b||20|z*8||||1||xobliterator~a4
Blue Dress with Beads|4|a|C||||||th550@fc||2|
Blue Dress with Shawl|3|a|C||||||th450@ci||2|
Blue Tied Headscarf|1|a|H||||||th200@6m||2|
Blue Tunic with Beads|4|a|C||||||th550@fc||2|
Blue Tunic with Cape|3|a|C||||||th450@ci||2|
Brown Dress with Beads|4|a|C||||||th550@fc||2|
Brown Dress with Shawl|3|a|C||||||th450@ci||2|
Brown Fur Cap|1|a|H||||||th200@6m||2|
Extravagant Green Cap|3|a|H||||||th250@ci||2|
Extravagant Orange Cap|4|a|H||||||th300@fc||2|
Green Twisted Headscarf|3|a|H||||||th250@ci||2|
Grey Fur Cap|4|a|H||||||th300@fc||2|
Harvest Dress|1|a|C||||||th550@6m||2|
Harvest Tunic|1|a|C||||||th550@6m||2|
Headband|1|a|H||||||th175||2|
Leather Helmet|0|a|H|3b|2||j*6||||1||u2~3b~j*6,3v*5~3;u3~3b~j*12,3v*10~4;u4~3b~j*24,3v*20~5;p4~~11
Leather Trousers|0|a|L|3b|2||j*6||||1||u2~3b~j*6,3v*5~3;u3~3b~j*12,3v*10~4;u4~3b~j*24,3v*20~5;p4~~11
Leather Tunic|0|a|C|3b|2||j*6||||1||u2~3b~j*6,3v*5~3;u3~3b~j*12,3v*10~4;u4~3b~j*24,3v*20~5;p4~~11
Midsummer Crown|0|a|H|3b|||i*10||xSeasonal: only craftable during the Midsummer event||2|Workbench, 10 Dandelion – only during the Midsummer event (confirmed).
Plain Blue Dress|1|a|C||||||th350@6m||2|
Plain Blue Tunic|1|a|C||||||th350@6m||2|
Plain Brown Dress|1|a|C||||||th350@6m||2|
Plain Red Tunic|1|a|C||||||th350@6m||2|
Plain Yellow Dress|1|a|C||||||th350@6m||2|
Plain Yellow Tunic|1|a|C||||||th350@6m||2|
Pointy Hat|1|a|H|3b|||j*3,3z*5,3w||xSeasonal: Halloween event||2||u2~3b~j*5~2;u3~3b~j*10~3;u4~3b~j*20~4;p4~~11,j*22
Rag Trousers|0|a|L|3b|||p*5||||1||u2~3b~p*5~2;p2~~11
Rag Tunic|0|a|C|3b|||p*5||||1||u2~3b~p*5~2;p2~~11
Red Tunic with Beads|4|a|C||||||th550@fc||2|
Red Tunic with Cape|3|a|C||||||th450@ci||2|
Red Twisted Headscarf|4|a|H||||||th300@fc||2|
Simple Purple Cap|1|a|H||||||th150||2|
Simple Red Cap|1|a|H||||||th150||2|
Simple Undyed Dress|1|a|C||||||th250||2|
Simple Undyed Tunic|1|a|C||||||th250||2|
Straw Hat|1|a|H||||||th300@6m||2|
Yellow Dress with Beads|4|a|C||||||th550@fc||2|
Yellow Dress with Shawl|3|a|C||||||th450@ci||2|
Yellow Tied Headscarf|3|a|H||||||th250@ci||2|
Yellow Tunic with Beads|4|a|C||||||th550@fc||2|
Yellow Tunic with Cape|3|a|C||||||th450@ci||2|
Boar Trophy|0|r|||||||||1||xobliterator~a4
Deer Trophy|0|r|||||||||2||xobliterator~a4
Eikthyr Trophy|0|r|||||||||2||xobliterator~a4
Neck Trophy|0|r|||||||||1||xobliterator~a4
Barber Kit|1|x|||||||th600||2|
Bed|0|S||3b|||z*8||||1|
Beehive|0|S||3b|||z*10,s||||1|
Campfire|0|S|||||y*5,z*2||||1||Fz
Chest|0|S||3b|||z*10||||1|
Cooking Station|0|S|||||z*2||||1|
Iron Fire Pit|1|S|||||o,z||||1||Fz
Raft|0|S||3b|||z*20,p*6,u*6||||1|
Workbench|0|S|||||z*10||||1|
Chopping Block|0|E||3b|||z*10,m*10||e3b||1|
Tanning Rack|0|E||3b|||z*10,m*15,p*20,j*5||e3b||1|
The Elder|1|B|||||6k*3|6i,6n::one per player|||2|
Brenna|1|M||||||6m,6b|||1|
Bear|1|C||||||3s,3r::2,3q::4,6a:10|||1|
Ghost|1|C||||||45::1–4,6c:10|||1|
Greydwarf|1|C||||||48:50,y,z,u,6f:5,oi,rf|||1|Also spawns at night in Meadows forests, but only after Eikthyr is killed – counted as Black Forest (killing a boss = moving on).
Greydwarf Brute|1|C||||||48:50:2,y::2,z::3–4,i,6k:33,6d:10|||1|
Greydwarf Shaman|1|C||||||48:50,z,u,6e:10,51,oi|||1|
Rancid Remains|1|C||||||6g:10,3v::3|||1|
Root (creature)|1|C|||||||||1|
Skeleton|0|C||||||6h:10,3v,oi|xSpawns at Dolmens in the Meadows at night (also Black Forest, Burial Chambers)||2|
Troll|1|C||||||g::20–30,6j:50,4m::5|||2|
Acorns|1|m|||||||gOak@58||1|
Bear Hide|1|m|||||||||1|
Bear Meat|1|m|||||||f7||1|
Bear Paw|1|m|||||||||1|
Birch Seeds|1|m|||||||gBirch@58||1|
Blue Fireworks|4|m||3b|||b,4r||||1|
Bone Fragments|0|m|||||||gSkeletal Remains;f1;xMined from Stone graves / Viking graveyards (Meadows); dropped by Skeletons at Dolmens (Meadows & Black Forest); tar-pit bone piles (Plains); Sunken Crypts (Swamp); Skugg (Ashlands)||1|
Bronze|1|m||6v|||40*2,4k||f7;xDestroying standing braziers in Frost Caves (Mountain)||1||aAlternative recipe~70~4g;aAlternative recipe · makes 5~6v~40*10,4k*5
Bronze Nails|1|m||6v||20|3w||||1|
Carrot Seeds|1|m|||||||gCarrot Seeds||1||xplant~4t
Coal|1|m||6t|||z||||1||aAlternative recipe · also: 1× Finewood~6t~;aAlternative recipe~6t~42
Copper|1|m||70|||41||f7||1||aAlternative recipe · also: 1× Copper Scrap~70~
Copper Ore|1|m|||||||gCopper Deposit,Copper vein||1|
Corewood|1|m|||||||gPine||1||xobliterator~a4
Corked Vial|2|m|||||||tW150@3e||2|
Cyan Fireworks|4|m||3b|||b,48||||1|
Ectoplasm|1|m|||||||||1|
Finewood|1|m|||||||gBirch,Oak@58||2||xobliterator~a4
Fir Cone|1|m|||||||gFir,Timber Tree||1|
Greydwarf Eye|1|m|||||||||1|
Iron Battle Idol|2|m|||||||f12||1|
Iron Protection Idol|2|m|||||||f12||1|
Mead Base: Minor Healing|1|m||6y|||17*10,4r*5,19*10,i||||1|
Mead Base: Minor Stamina|1|m||6y|||17*10,19*10,50*10||||1|
Mead Base: Poison Resistance|1|m||6y|||17*10,4i*5,r,3z*10||||2|
Mead Base: Tasty|1|m||6y|||17*10,19*10,4r*5||||1|
Pine Cone|1|m|||||||gPine,Timber Tree||1|
Scrap Bronze|6|m|||||||xBreak Charred Fortress spike walls (Ashlands), smelt in a Smelter → Bronze||2|
Surtling Core|1|m|||||||gSurtling Core;xFuling village bonfires (Plains); Dvergr lanterns (Mistlands)||2|
Thistle|1|m|||||||gThistle||1|
Thunder Stone|2|m|||||||tH50@3e||2|
Tin|1|m||70|||4l||f7||1|
Tin Ore|1|m|||||||gTin Ore;xBarrels near Black Forest stone ruins||1|
Troll Hide|1|m|||||||xFishing bonus from Trollfish||1|
Woodland Herb Blend|2|m|||||||tW120@3e||2|
Ymir Flesh|2|m|||||||tH120@3e||2|
Pike|1|h|||||||b5q;bbt;xMeadows and Black Forest waters (Fishing Bait or Cold Fishing Bait)||2|
Trollfish|2|h|||||||b9b;xCaught with a Fishing Rod + bait||2|
Blueberries|1|f|||||||gBlueberries;xBarrels at Greydwarf towers||1|
Boar Jerky|1|f||6s||2|d,17||||1|
Carrot|1|f|||||||gCarrot||1|
Carrot Soup|1|f||6s|||18,4t*3||||1|
Cooked Bear Meat|1|f||38|||3r||||1||aAlternative recipe~a2~3r
Deer Stew|1|f||6s|||15,4r,4t||||1|
Minced Meat Sauce|1|f||6s|||d,r,4t||||1|
Pulled Bear|1|f||6s|||4v,4t*2,4r||||1|
Queen's Jam|1|f||6s||4|19*8,4r*6||||1|
Yellow Mushroom|1|f|||||||gYellow Mushroom||1|
Bukeperries|1|d|||||||||1|
Minor Healing Mead|1|d||6u|||4b||||1|
Minor Stamina Mead|1|d||6u|||4c||||1|
Poison Resistance Mead|1|d||6u|||4d||||1|
Tasty Mead|1|d||6u|||4e||f7||1|
Cultivator|1|t||6v|||42*5,3w*5||||1||u2~6v~42,3w~2;u3~6v~42*2,3w*2~3;p3~~10
Bronze Atgeir|1|w|2|6v|||z*10,3w*8,p*2||||1||u2~6v~3w*4~2;u3~6v~3w*8~3;u4~6v~3w*16~4;p4~~e
Bronze Axe|1|w|1|6v|||z*4,3w*8,p*2||||1||u2~6v~3w*4,p~2;u3~6v~3w*8,p*2~3;u4~6v~3w*16,p*4~4;p4~~49
Bronze Mace|1|w|1|6v|||z*4,3w*8,p*3||||1||u2~6v~3w*4~2;u3~6v~3w*8~3;u4~6v~3w*16~4;p4~~e
Bronze Pickaxe|1|w|2|6v|||42*3,3w*10||||2||u2~6v~42,3w*5~2;u3~6v~42*2,3w*10~3;u4~6v~42*4,3w*20~4;p4~~e
Bronze Spear|1|w|1|6v|||z*5,3w*6,j*2||||1||u2~6v~z*3,3w*4,j~2;u3~6v~z*6,3w*8,j*2~3;u4~6v~z*12,3w*16,j*4~4;p4~~e
Bronze Sword|1|w|1|6v|||z*2,3w*8,p*2||||1||u2~6v~z,3w*4,p~2;u3~6v~z*2,3w*8,p*2~3;u4~6v~z*4,3w*16,p*4~4;p4~~e
Butcher Knife|1|w|1|6v|||z*2,4k*4||||1|
Copper Knife|1|w|1|6v|||z*2,40*8||||1||u2~6v~40*4,48*8~2;u3~6v~40*8,48*16~3;u4~6v~40*16,48*32~4;p4~~e
Finewood Bow|1|w|b|3b|||46*10,42*10,j*2||||1||u2~3b~46*5,42*5,j*2~2;u3~3b~46*10,42*10,j*4~3;u4~3b~46*20,42*20,j*8~4;p4~~e
Fishing Rod|1|w|2||||||gFishing Rod;tH350;xRare pickable on the frozen lake in Frost Caves (Mountain)||2|
Mead Horn of Oden|1|w|1|3b|||46*4,30,u*2||||1|
Paws of the Bear|1|w|2|3b|2||3q*2,3s*2,p*4||||1||u2~3b~3q*2,p*2~3;u3~3b~3q*4,p*4~4;u4~3b~3q*8,p*8~5;p4~~e
Stagbreaker|1|w|2|3b|2||42*20,30*5,p*2||||1||u2~3b~42*5,30*2,p,3v*10~3;u3~3b~42*10,30*4,p*2,3v*20~4;u4~3b~42*20,30*8,p*4,3v*40~5;p4~~10
Tankard|1|w|1|3b|||46*5,u*2||||1|
Wooden Spear|1|w|1||||||f1||1|
Wooden Sword|1|w|1|3b|||z*5,46*3,42*2||||1||u2~3b~z,46*10,42*2~2;u3~3b~z*2,46*20,42*4~3;u4~3b~z*4,46*40,42*8~4;p4~~e
Bone Tower Shield|0|s||3b|3||z*10,3v*10,6h*3||||1||u2~3b~z*5,3v*5~4;u3~3b~z*10,3v*10~5;p3~~f
Bronze Buckler|1|s||6v|||3w*10,z*4||||1||u2~6v~3w*5,z~2;u3~6v~3w*10,z*2~3;p3~~f
Bronzehead Arrow|1|o||6v||20|z*8,3w,l*2||||1||xobliterator~a4
Fishing Bait|1|o|||||||gFishing Rod;tH10;xPickable at the frozen lake in Frost Caves (Mountain)||2|
Bronze Helmet|1|a|H|6v|||3w*5,j*2||||1||u2~6v~3w*3~2;u3~6v~3w*6~3;u4~6v~3w*12~4;p4~~f
Bronze Pendant|1|a|T|6v|||3w*5,6a,w*3||||1|
Bronze Plate Leggings|1|a|L|6v|||3w*5,j*2||||1||u2~6v~3w*3~2;u3~6v~3w*6~3;u4~6v~3w*12~4;p4~~f
Bronze Plate Tunic|1|a|C|6v|||3w*5,j*2||||1||u2~6v~3w*3~2;u3~6v~3w*6~3;u4~6v~3w*12~4;p4~~f
Cape of Oden|1|a|K|3b|||p*10,3z*4||||1||u2~3b~p*5,3z*2~2;u3~3b~p*10,3z*4~3;u4~3b~p*20,3z*8~4;p4~~f
Celebratory Cap|1|a|H|3b|2||j*2,3w,3q,a||||1||u2~3b~j,3w~3;u3~3b~j*2,3w*2~4;u4~3b~j*4,3w*4~5;p4~~11
Deer Hide Cape|0|a|K|3b|2||j*4,3v*5||||1||u2~3b~j*4,3v*5~3;u3~3b~j*8,3v*10~4;u4~3b~j*16,3v*20~5;p4~~11
Dverger Circlet|1|a|H||||||tH620||2|
Headdress of the Bear|1|a|H|3b|2||3q*5,6a||||1||u2~3b~3q*2~3;u3~3b~3q*4~4;u4~3b~3q*8~5;p4~~db
Heart of the Forest|1|a|T|6v|||3w*5,6k*5,6e||||1|
Hood of Oden|1|a|H|3b|||p*10,3z*4||||1||u2~3b~p*5,3z*2~2;u3~3b~p*10,3z*4~3;u4~3b~p*20,3z*8~4;p4~~f
Loincloth of the Bear|1|a|L|3b|2||3q*5,4r*4||||1||u2~3b~3q*2,4r~3;u3~3b~3q*4,4r*2~4;u4~3b~3q*8,4r*4~5;p4~~f
Megingjord|1|a|U||||||tH950||2|
Patterns of the Bear|1|a|C|3b|2||3q*5,3s*2,4r*4||||1||u2~3b~3q*2,4r~3;u3~3b~3q*4,4r*2~4;u4~3b~3q*8,4r*4~5;p4~~f
Troll Hide Cape|1|a|K|3b|2||4m*10,3v*10||||1||u2~3b~4m*5,3v*5~3;u3~3b~4m*10,3v*10~4;u4~3b~4m*20,3v*20~5;p4~~f
Troll Leather Hood|1|a|H|3b|2||4m*5,3v*3||||1||u2~3b~4m*2,3v~3;u3~3b~4m*4,3v*2~4;u4~3b~4m*8,3v*4~5;p4~~f
Troll Leather Trousers|1|a|L|3b|2||4m*5||||1||u2~3b~4m*2~3;u3~3b~4m*4~4;u4~3b~4m*8~5;p4~~f
Troll Leather Tunic|1|a|C|3b|2||4m*5||||2||u2~3b~4m*2~3;u3~3b~4m*4~4;u4~3b~4m*8~5;p4~~f
Yule Hat|1|a|H||||||tH100||2|
Bear Trophy|1|r|||||||||1|
Brenna Trophy|1|r|||||||||1|
Ghost Trophy|1|r|||||||||1|
Greydwarf Brute Trophy|1|r|||||||||1||xobliterator~a4
Greydwarf Shaman Trophy|1|r|||||||||1||xobliterator~a4
Greydwarf Trophy|1|r|||||||||1||xobliterator~a4
Rancid Remains Trophy|1|r|||||||||1||xobliterator~a4
Skeleton Trophy|0|r|||||||||1||xobliterator~a4
The Elder Trophy|1|r|||||||||1||xobliterator~a4
Troll Trophy|1|r|||||||||1||xobliterator~a4
Ancient Seed|1|x|||||||xDestroying Greydwarf nests||2|
Barrel Hoops|1|x|||||||tH100||2|
Hildir's Brass Chest|1|x|||||||||2|Smouldering Tomb (Black Forest), dropped by Brenna. Carry it back to Hildir (it cannot go through a portal) to unlock more of her stock.
Swamp Key|1|x|||||||||2|
Barber Station|1|S||3b|||46*10,33,3x*5,4m*5||||1|
Barrel|1|S||3b|||z*10,6l||||1|
Cart|1|S||3b|||z*20,3x*10||||1|
Cartography Table|1|S||3b|||46*10,3v*10,3w*2,p*5,19*4||||1|
Cauldron|1|S||6v|||4k*10||||1|
Charcoal Kiln|1|S||3b|||y*20,4h*5||||2|
Fermenter|1|S||6v|||46*30,3w*5,u*10||||1|
Forge|1|S||3b|||y*4,3z*4,z*10,40*6||||2|
Item Stand|1|S||3b|||46*4,3x||||1|
Karve|1|S||3b|||46*30,j*10,u*20,3x*80||||2|
Mead Ketill|1|S||6v|||4k*4,40*6,p*2||||1|In-game name Mead Ketill (source.gs 1.0.20, Jotunn piece list, valheim.tools slug building/mead-ketill). Earlier note claiming valheim.tools calls it "Mead Cauldron" was wrong.
Portal|1|S||3b|||48*10,46*20,4h*2||||2|
Smelter|1|S||3b|||y*20,4h*5||||2||F3z
Ward|1|S|||||46*5,48*5,4h||||1|
Adze|1|E||6v|||46*10,3w*3||e3b||1|
Anvils|1|E||3b|||z*5,3w*2||e6v||1|
Forge Cooler|1|E||3b|||46*25,40*10||e6v||1|
Bonemass|2|B|||||8d*10|9q,9n::one per player|||2|
Kvastur|2|M||||||z,u,9t|||1|
Abomination|2|C||||||84::5,7p::3–5,9o:50|||2|Not on valheim.source.gs; data from valheim.tools
Blob|2|C||||||9p:10,7z|||1|
Draugr|2|C||||||7m,9s:10|||1|
Draugr Elite|2|C||||||7m::2,9r:10|||1|
Leech|2|C||||||9u:10,7i|||1|
Oozer|2|C||||||7z::2,85:33,9p:10|||1|
Surtling|2|C||||||3z::4,4h:50,9v:5|||1|
Wraith|2|C||||||9w:5,7k|||1|
Writhan|2|C||||||9x:10,8e|||1|
Ancient Bark|2|m|||||||gAncient Tree@58;f2||1||xobliterator~a4
Black Forest Buffet Platter|2|m||a0|||4w*3,4i*5,4z*4,4n||||1|
Bloodbag|2|m|||||||||1|
Candle Wick|2|m|||||||tW100||2|
Chain|2|m|||||||f2;xSealed Tower chests (Plains); Dvergr harbour hooks (Mistlands)||2|
Cured Squirrel Hamstring|2|m|||||||tW80||2|
Entrails|2|m|||||||gMeat Pile;xMeat piles in Frost Caves / Howling Caverns (Mountain) and Putrid Holes (Ashlands)||1|
Fresh Seaweed|2|m|||||||tW75||2|
Green Fireworks|4|m||3b|||b,7p||||1|
Guck|2|m|||||||||1|
Iron|2|m||70|||7s||||1||aAlternative recipe~70~85
Iron Nails|2|m||6v||10|7q||||1|
Iron Ore|2|m|||||||gIron vein,Bog Iron,Meteorite;xFishing bonus from Giant Herring. NOTE: Iron veins only exist via console/dev commands||1|
Ivy Seeds|2|m|||||||gVineberry Cluster;tW65||2|
Mead Base: Frost Resistance|2|m||6y|||17*10,4i*5,7i*2,48||||1|
Mead Base: Medium Healing|2|m||6y|||17*10,7i*4,19*10,i||||1|
Mead base: Ratatosk|2|m||6y|||17*10,4r*10,7l||||1|
Mead Base: Troll Endurance|2|m||6y|||4q*2,17*10,80||||1|
Mead Base: Vananidir|2|m||6y|||i*10,13*2,7n||||1|
Ooze|2|m|||||||||1|
Powdered Dragon Eggshells|2|m|||||||tW120||2|
Pungent Pebbles|2|m|||||||tW125||2|
Purple Fireworks|4|m||3b|||b,8a||||1|
Raw Fish|2|m||a0|||13,4p,t8,b7,4q,8f,dt,t7,gu,q1,kn,gv||||1|Recipe has alternatives: any 1 fish → Raw Fish (Food Preparation Table).
Root|2|m|||||||||1|
Scrap Iron|2|m|||||||gAncient Armour,Ancient Sword,Muddy Scrap Pile||1|
Sharpening Stone|2|m||a7|||y*5||f4||1|
Silver Battle Idol|3|m|||||||f23||1|
Silver Protection Idol|3|m|||||||f23||1|
Swamp Dweller's Delight|2|m||a0|||8j*8,7i*4,8k*2,4n||||1|
Turnip|2|m|||||||gTurnip||1|
Turnip Seeds|2|m|||||||gTurnip Seeds||1||xplant~8a
Whole Roasted Meadow Boar|2|m||a0|||15*2,14*5,i*4,4n||||1|
Withered Bone|2|m|||||||gMuddy Scrap Pile;f2||2|
Writhan Roots|2|m|||||||||2|
Giant Herring|2|h|||||||b9d;xCaught with a Fishing Rod + bait||2|
Black Soup|2|f||6s|2||7i,17,8a||||1|
Cooked Fish|2|f||38|||83||||1||aAlternative recipe~a2~83
Muckshake|2|f||6s|2||7z,19*2,4r*2||||1|
Sausages|2|f||6s|2|4|7m*4,d,4i||||1|
Turnip Stew|2|f||6s|2||d,8a*3||||1|
Draught of Vananidir|2|d||6u|||7y||||1|
Frost Resistance Mead|2|d||6u|||7u||||1|
Love Potion|2|d|||||||tW110||2|
Mead of Troll Endurance|2|d||6u|||7x||||1|
Medium Healing Mead|2|d||6u|||7v||f7||1|
Tonic of Ratatosk|2|d||6u|||7w||||1|
Serving Tray|2|t|||||||tW140||2|
Ancient Bark Spear|2|w|1|6v|3||4m*4,7q*10,7g*10||||1||u2~6v~4m,7q*5,7g*5~4;u3~6v~4m*2,7q*10,7g*10~5;u4~6v~4m*4,7q*20,7g*20~6;p4~~49
Battleaxe|2|w|2|6v|2||7g*30,7q*35,p*4||||1||u2~6v~7g*5,7q*15~3;u3~6v~7g*10,7q*30~4;u4~6v~7g*20,7q*60~5;p4~~49
Blob Bomb: Elite Poison|2|w|1|3b|||43,9p*3,u*3||||1|
Blob Bomb: Poison|2|w|1|3b|||43,9p,u*3||||1|
Horn of Celebration|2|w|1|3b|||3w*2,4m*2,7q*2||||1|
Huntsman Bow|2|w|b|6v|||46*10,7q*20,l*10,j*2||||1||u2~6v~46*5,7q*10,l*5,j*2~2;u3~6v~46*10,7q*20,l*10,j*4~3;u4~6v~46*20,7q*40,l*20,j*8~4;p4~~49
Iron Atgeir|2|w|2|6v|2||z*10,7q*30,p*2||||1||u2~6v~7q*15,p~3;u3~6v~7q*30,p*2~4;u4~6v~7q*60,p*4~5;p4~~49
Iron Axe|2|w|1|6v|2||z*4,7q*20,p*2||||1||u2~6v~7q*10,p~3;u3~6v~7q*20,p*2~4;u4~6v~7q*40,p*4~5;p4~~87
Iron Mace|2|w|1|6v|2||z*4,7q*20,p*3||||1||u2~6v~7q*10~3;u3~6v~7q*20~4;u4~6v~7q*40~5;p4~~49
Iron Pickaxe|2|w|2|6v|2||42*3,7q*20||||2||u2~6v~42,7q*10~3;u3~6v~42*2,7q*20~4;u4~6v~42*4,7q*40~5;p4~~49
Iron Sledge|2|w|2|6v|2||7g*10,7q*30,4o*4,9r||||1||u2~6v~7g*2,7q*15,4o*2~3;u3~6v~7g*4,7q*30,4o*4~4;u4~6v~7g*8,7q*60,4o*8~5;p4~~49
Iron Sword|2|w|1|6v|2||z*2,7q*20,p*3||||1||u2~6v~z,7q*10,p*2~3;u3~6v~z*2,7q*20,p*4~4;u4~6v~z*4,7q*40,p*8~5;p4~~49
Ooze Bomb|2|w|1|3b||5|p*5,7z*5,u*3||||1|
Wooden Sledge|2|w|2||||||f2||1|
Banded Shield|2|s||6v|2||46*10,7q*8||||1||u2~6v~46*10,7q*4~3;u3~6v~46*20,7q*8~4;p3~~4a
Iron Buckler|2|s||6v|2||7q*10,7g*4||||1||u2~6v~7q*5,7g~3;u3~6v~7q*10,7g*2~4;p3~~4a
Iron Tower Shield|2|s||6v|2||46*15,7q*10||||1||u2~6v~46*10,7q*5~3;u3~6v~46*20,7q*10~4;p3~~4a
Shield of Roots|2|s||3b|2||46*10,8e||||1||u2~3b~46*5,8e*2~3;u3~3b~46*10,8e*4~4;p3~~4a
Ironhead Arrow|2|o||6v|2|20|z*8,7q,l*2||f2||1||xobliterator~a4
Mossy Fishing Bait|2|o||a0||20|5q*20,6j||||1|
Poison Arrow|2|o||3b|3|20|z*8,az*4,l*2,7z*2||f2||2|valheim.tools: Workbench lvl 3 (Wood 8, Obsidian 4, Feathers 2, Ooze 2 → 20); also in Swamp ruin and grave chests (11% per roll, 10–15); Swamp chest loot also confirmed by the user|xobliterator~a4
Sticky Fishing Bait|2|o||a0||20|5q*20,9o||||1|
Crown of Roots|2|a|H||||||tW3000@7f||2|
Iron Brooch|2|a|T|6v|||7q*5,7g*5,9u||||1|
Iron Greaves|2|a|L|6v|2||7q*20,j*2||||1||u2~6v~7q*5~3;u3~6v~7q*10~4;u4~6v~7q*20~5;p4~~4a
Iron Helmet|2|a|H|6v|||7q*20,j*2||||1||u2~6v~7q*5~2;u3~6v~7q*10~3;u4~6v~7q*20~4;p4~~4a
Iron Scale Mail|2|a|C|6v|2||7q*20,j*2||||1||u2~6v~7q*5~3;u3~6v~7q*10~4;u4~6v~7q*20~5;p4~~4a
Nimble Anklet|2|a|T|6v|||7q*5,8d*5,9v||||1|
Root Harnesk|2|a|C|3b|2||84*10,7g*10,j*2||||1||u2~3b~84*2,7g*5~3;u3~3b~84*4,7g*10~4;u4~3b~84*8,7g*20~5;p4~~4a
Root Leggings|2|a|L|3b|2||84*10,7g*10,j*2||||1||u2~3b~84*2,7g*5~3;u3~3b~84*4,7g*10~4;u4~3b~84*8,7g*20~5;p4~~4a
Root Mask|2|a|H|3b|2||84*10,7g*10,p*4||||1||u2~3b~84*2,7g*5~3;u3~3b~84*4,7g*10~4;u4~3b~84*8,7g*20~5;p4~~4a
Wishbone|2|a|U||||||||2|
Abomination Trophy|2|r|||||||||1||xobliterator~a4
Blob Trophy|2|r|||||||||1||xobliterator~a4
Bonemass Trophy|2|r|||||||||1||xobliterator~a4
Draugr Elite Trophy|2|r|||||||||1||xobliterator~a4
Draugr Trophy|2|r|||||||||1||xobliterator~a4
Kvastur Trophy|2|r|||||||||2|Dropped by the Kvastur miniboss. In game the trophy item is simply called "Kvastur".
Leech Trophy|2|r|||||||||1||xobliterator~a4
Surtling Trophy|2|r|||||||||1||xobliterator~a4
Wraith Trophy|2|r|||||||||1||xobliterator~a4
Writhan Trophy|2|r|||||||||1|
Armour Stand|2|S||3b|||46*8,7r*4,p*2||||1|
Bonfire|2|S|||||4h,7g*5,46*5,42*5||||1||Fz
Food Preparation Table|2|S||3b|||7q*5,46*20,p*15||||1|
Hearth|2|S||a7|||y*15||||1||Fz
Iron Cooking Station|2|S||6v|||7q*3,7k*3||||1|
Longship|2|S||3b|||7r*100,j*10,46*40,7g*40||||2|
Obliterator|2|S||6v|||7q*8,40*4,4j||||1|
Personal Chest|2|S||3b|||46*10,7q*8||||1|
Reinforced Chest|2|S||3b|||46*10,7q*2||||1|
Stonecutter|2|S||3b|||z*10,7q*2,y*4||||1|
Forge Bellows|2|E||3b|||z*5,j*5,7k*4||e6v||1|
Forge Tool Rack|2|E||3b|||7q*15,z*10||e6v||1|
Grinding Wheel|2|E||3b|||z*25,86||e6v||1|
Smith's Anvil|2|E||3b|||7q*20,z*5||e6v||1|
Spice Rack|2|E||3b|||i*3,4t*2,18*5,4i*3,8a*3||e6s||1|
Moder|3|B|||||cg*3|cc,ch::10|||2|
Geirrhafa|3|M||||||ci,cb|||1|
Bat|3|C||||||p:50|||1|
Cultist|3|C||||||b1::1–2,c8:10|||1|
Drake|3|C||||||c9:10,at|||1|
Fenring|3|C||||||b4,ca:10|||1|
Stone Golem|3|C||||||cd:5,y::5–9,ap::8–11|||1|
Ulv|3|C||||||b4:50,ce:10|||1|
Wolf|3|C||||||cf:10,b5,b6,b4:40||r,d,dj,8j,83,k,df|1|
Wolf Cub|3|C|||||||||1|
Black Metal Battle Idol|4|m|||||||f34||1|
Black Metal Protection Idol|4|m|||||||f34||1|
Crystal|3|m|||||||gCrystal||1|
Fenris Claw|3|m|||||||xLoose in Frost Caves (50% spawn point)||2|
Fenris Hair|3|m|||||||gFenris Hair||1|
Fragrant Bundle|4|m|||||||tW140@ad||2|
Freeze Gland|3|m|||||||||1|
Frostcore|3|m|||||||gFrost Core Hanger;xFrost Core Hangers in Mountain frost caves (they do not regrow); also dropped by Frysling (Deep North) 100% ×1||2|Earliest source: Mountain frost caves. Used for the Frigid Kiln (10) and Frost Foundry (10).
Hearty Mountain Logger's Stew|4|m||a0|||be*2,bc*3,4t*4,ay||||1|
Mead Base: Animal Whispers|3|m||6y|||bb*5,4t*10,81||||1|
Mead base: Berserkir|4|m||6y|||18*10,50*10,bh||||1|
Mountain Peak Pepper Powder|4|m|||||||tW140@ad||2|
Obsidian|3|m|||||||gObsidian;f3||1|
Onion Seeds|3|m|||||||gOnion Seeds;f3;xFishing bonus from Coral Cod||1||xplant~bb
Red Jute|3|m|||||||xCurtains in Frost Caves||1|
Silver|3|m||70|||b3||||1|
Silver Ore|3|m|||||||gSilver Deposit,Silver Vein@91||1|
Wolf Fang|3|m|||||||||1|
Wolf Meat|3|m|||||||||1|
Wolf Pelt|3|m|||||||||1|
Tetra|3|h|||||||bbt;xCaught with a Fishing Rod + bait||2|
Blue Mushroom|3|f|||||||||2|Console-only: unimplemented; the pickable never generates in a normal world, like Riktig Fuling. No links.
Cooked Wolf Meat|3|f||38|||b5||||2||aAlternative recipe~a2~b5
Eyescream|3|f||6s|3||48*3,at||||1|
Onion|3|f|||||||gOnion;f7||1|
Onion Soup|3|f||6s|2||bb*3||||1|
Wolf Jerky|3|f||6s|3|2|b5,17||||1|
Wolf Skewer|3|f||6s|3||b5,18*2,bb||||1|
Berserkir Mead|4|d||6u|||ax||||1|
Brew of Animal Whispers|3|d||6u|||aw||||1|
Toadstool|4|d|||||||tW85@ad||2|
Blob Bomb: Frost|3|w|1|3b|||43,c9,u*3||||1|
Crystal Battleaxe|3|w|2|6v|3||7g*40,b2*30,ap*10||||1||u2~6v~7g*5,b2*15~4;u3~6v~7g*10,b2*30~5;u4~6v~7g*20,b2*60~6;p4~~87
Draugr Fang|3|w|b|6v|2||7g*10,b2*20,j*2,7p*10||||1||u2~6v~7g*5,b2*10,j*2,7p*2~3;u3~6v~7g*10,b2*20,j*4,7p*4~4;u4~6v~7g*20,b2*40,j*8,7p*8~5;p4~~49
Fang Spear|3|w|1|6v|3||7g*10,b4*4,p*2,b2*2||||1||u2~6v~7g*5,b4*2,p,b2~4;u3~6v~7g*10,b4*4,p*2,b2*2~5;u4~6v~7g*20,b4*8,p*4,b2*4~6;p4~~87
Flesh Rippers|3|w|2|6v|3||ar*10,aq*6,b2*10||||1||u2~6v~ar,aq,b2~4;u3~6v~ar*2,aq*2,b2*2~5;u4~6v~ar*4,aq*4,b2*4~6;p4~~87
Frostner|3|w|1|6v|3||7g*10,b2*30,4o*5,at*5||||2||u2~6v~b2*15~4;u3~6v~b2*30~5;u4~6v~b2*60~6;p4~~87
Scythe|4|w|2|6v|2||cj,b2*6||||1||u2~6v~b2*5~3;u3~6v~b2*10~4;p3~~10
Silver Knife|3|w|1|6v|3||z*2,b2*10,p*3,7q*2||||1||u2~6v~z,b2*5,p,7q~4;u3~6v~z*2,b2*10,p*2,7q*2~5;u4~6v~z*4,b2*20,p*4,7q*4~6;p4~~87
Silver Sword|3|w|1|6v|3||z*2,b2*40,p*3,7q*5||||1||u2~6v~z,b2*20,p,7q*3~4;u3~6v~z*2,b2*40,p*2,7q*6~5;u4~6v~z*4,b2*80,p*4,7q*12~6;p4~~87
Wooden Battleaxe|3|w|2||||||f3||1|
Silver Shield|3|s||6v|3||46*10,b2*8||||1||u2~6v~46*10,b2*4~4;u3~6v~46*20,b2*8~5;p3~~88
Cold Fishing Bait|3|o||a0||20|5q*20,ca||||1|
Frost Arrow|3|o||3b|4|20|z*8,az*4,l*2,at||f3||1||xobliterator~a4
Frosty Fishing Bait|3|o||a0||20|5q*20,c9||||1|
Obsidian Arrow|3|o||3b|3|20|z*8,az*4,l*2||f4||1||xobliterator~a4
Silver Arrow|3|o||6v|3|20|z*8,b2,l*2||||1||xobliterator~a4
Wooden Missile|3|o||ck||20|42*5,l*2||||1||xammo~io
Crystal Heart|3|a|T|6v|||b2*5,ap*5,cd||||1|
Drake Helmet|3|a|H|6v|||b2*20,b6*2,c9*2||||1||u2~6v~b2*5~2;u3~6v~b2*10~3;u4~6v~b2*20~4;p4~~88
Fenris Coat|3|a|C|3b|2||ar*20,b6*5,p*10||||1||u2~3b~ar*5,b6*3,p*4~3;u3~3b~ar*10,b6*6,p*8~4;u4~3b~ar*20,b6*12,p*16~5;p4~~88
Fenris Hood|3|a|H|3b|2||ar*20,b6*2,c8||||1||u2~3b~ar*5,b6*4~3;u3~3b~ar*10,b6*8~4;u4~3b~ar*20,b6*16~5;p4~~88
Fenris Leggings|3|a|L|3b|2||ar*20,b6*5,p*10||||1||u2~3b~ar*5,b6*3,p*4~3;u3~3b~ar*10,b6*6,p*8~4;u4~3b~ar*20,b6*12,p*16~5;p4~~88
Wolf Fur Cape|3|a|K|3b|2||b6*6,b2*4,cf||||1||u2~3b~b6*4,b2*2~3;u3~3b~b6*8,b2*4~4;u4~3b~b6*16,b2*8~5;p4~~88
Wolf Hide Chestpiece|3|a|C|6v|2||b2*20,b6*5,7k||||2||u2~6v~b2*5,b6*2~3;u3~6v~b2*10,b6*4~4;u4~6v~b2*20,b6*8~5;p4~~88
Wolf Hide Trousers|3|a|L|6v|2||b2*20,b6*5,b4*4||||1||u2~6v~b2*5,b6*2,b4~3;u3~6v~b2*10,b6*4,b4*2~4;u4~6v~b2*20,b6*8,b4*4~5;p4~~88
Wolf Sight|3|a|T|6v|||b2*5,b4*5,ca||||1|
Cultist Trophy|3|r|||||||||1||xobliterator~a4
Drake Trophy|3|r|||||||||1||xobliterator~a4
Fenring Trophy|3|r|||||||||1||xobliterator~a4
Geirrhafa Trophy|3|r|||||||||1|
Moder Trophy|3|r|||||||||1||xobliterator~a4
Stone Golem Trophy|3|r|||||||||1||xobliterator~a4
Ulv Trophy|3|r|||||||||1||xobliterator~a4
Wolf Trophy|3|r|||||||||1||xobliterator~a4
Dragon Egg|3|x|||||||gDragon Egg||2|
Dragon Tear|3|x|||||||||2|
Hildir's Silver Chest|3|x|||||||||2|Howling Cavern (Mountain), dropped by Geirrhafa. Carry it back to Hildir (it cannot go through a portal) to unlock more of her stock.
Scythe Handle|4|x|||||||tW200@ad||2|
Artisan Table|3|S|||||z*10,ch*2||||2|
Blast Furnace|3|S||ck|||y*20,4h*5,7q*10,46*20||||2||F3z
Dragon Bed|3|S||3b|||46*40,j*7,b6*4,l*10,7r*15||||1|
Frost Foundry|3|S||3b|||7q*15,y*20,au*10||xFuel: Liquid Frost||2||Fol
Rustic Drawbridge|3|S||3b|||b2*2,cf*2,42*10||||1|
Spinning Wheel|3|S||ck|||46*20,7r*10,p*5||||2|
Stone Oven|3|S||ck|||7q*15,y*20,4h*4||||1||Fz
Windmill|3|S||ck|||y*20,z*30,7r*30||||2|
Butcher's Table|3|E||3b|||7g*2,42*4,46*4,b2*2||e6s||1|
Tool Shelf|3|E||6v|||7q*4,46*10,az*4||e3b||1|
Yagluth|4|B|||||fb*5|f7,fe::3|||2|Offering: 5 Fuling Totems (valheim.tools)
Thungr|4|M||||||fc,f5:100:1|||1|Fought together with Zil in Hildir's Sealed Tower (Plains).
Zil|4|M||||||fc,f8:100:1|||1|
Chicken|4|C||||||df:25,l:50|||1|
Deathsquito|4|C||||||dn,ez:5|||1|
Fuling|4|C||||||g:25:5–9,dd,f2:10|||1|
Fuling Berserker|4|C||||||g::5–19,dd::3–4,fb:10,f0:5|||1|
Fuling Shaman|4|C||||||g:25:20–39,dd,51,f1:10|||1|
Growth|4|C||||||f3:10,dp|||1|
Hen|4|C||||||df,l::1–2||i,d8,c,3t,3y,b0,8b|1|
Lox|4|C||||||dj::4–5,f4:10,dk::2||dw,d8,dg|1|
Lox Calf|4|C||||||dj|||1|
Riktig Fuling|4|C|||||||||2|Console command only; does not spawn in a normal world (valheim.tools). Drops omitted so it has no links.
Vile|4|C||||||f6:10,3r::2,e6:80,ds::1–2,3q|||1|
Barley|4|m|||||||gBarley;f4||1|
Barley Wine Base: Fire Resistance|4|m||6y|||d8*10,dw*10||||1|
Black Marble Battle Idol|5|m|||||||f456||1|
Black Marble Protection Idol|5|m|||||||f456||1|
Black Metal|4|m||cl|||dd||||1|
Black Metal Scrap|4|m|||||||f4||1|
Bread Dough|4|m||a0||2|f9*10||||1|
Chicken Meat|4|m|||||||||1|
Flax|4|m|||||||gFlax||1|
Grasslands Herbalist Harvest|5|m|||||||tW160@cu||2|
Linen Thread|4|m||cp|||dg||||1|
Lox Meat|4|m|||||||||1|
Lox Pelt|4|m|||||||||1|
Mead Base: Anti-Sting|4|m||6y|||dw*10,dt*3,as||||1|
Mead Base: Medium Stamina|4|m||6y|||17*10,dw*10,50*10||||1|
Needle|4|m|||||||f4||1|
Plains Pie Picnic|5|m||a0|||dv*3,e2*2,dw*5,dh||||1|
Tar|4|m|||||||gTar||1|
Unbaked Lox Pie|4|m||a0|||dw*2,dj*2,f9*4||||1|
Unbaked Sweetbread|4|m||a0|||dw*2,fa,f9,17||||1|
Vile Ribcage|4|m|||||||||1|
Grouper|4|h|||||||bel;xCaught with a Fishing Rod + bait||2|
Blood Pudding|4|f||6s|4||4i*2,7i*2,f9*4||||1|
Bread|4|f||cq|||de||f7||1|
Cloudberries|4|f|||||||gCloudberries||1|
Cooked Chicken Meat|4|f||38|||df||||1||aAlternative recipe~a2~df
Cooked Egg|4|f||6s|||fa||||1|
Cooked Lox Meat|4|f||a2|||dj||||1||aAlternative recipe~a2~dj
Fish Wraps|4|f||6s|4||8h*2,f9*4||||1|
Frosted Sweetbread|4|f||cq|||dr||||1|
Lox Meat Pie|4|f||cq|||dq||||1|
Anti-Sting Concoction|4|d||6u|||dl||||1|
Fire Resistance Barley Wine|4|d||6u|||d9||||1|
Medium Stamina Mead|4|d||6u|||dm||f7||1|
Rotten Meat|4|d|||||||xFlesh mounds in Putrid Holes (Ashlands)||1|
Black Metal Atgeir|4|w|2|6v|4||46*10,dc*30,di*5||||1||u2~6v~dc*15,di*5~5;u3~6v~dc*30,di*10~6;u4~6v~dc*60,di*20~7;p4~~an
Black Metal Axe|4|w|1|6v|4||46*6,dc*20,di*5||||1||u2~6v~dc*10,di*5~5;u3~6v~dc*20,di*10~6;u4~6v~dc*40,di*20~7;p4~~an
Black Metal Battleaxe|4|w|2|6v|4||46*10,dc*30,di*5||||1||u2~6v~dc*15,di*5~5;u3~6v~dc*30,di*10~6;u4~6v~dc*60,di*20~7;p4~~an
Black Metal Knife|4|w|1|6v|4||46*4,dc*10,di*5||||1||u2~6v~dc*4,di*5~5;u3~6v~dc*8,di*10~6;u4~6v~dc*16,di*20~7;p4~~an
Black Metal Sword|4|w|1|6v|4||46*2,dc*20,di*5||||2||u2~6v~dc*10,di*5~5;u3~6v~dc*20,di*10~6;u4~6v~dc*40,di*20~7;p4~~an
Blob Bomb: Tar|4|w|1|3b|||43,f3,dp*3||||1|
Porcupine|4|w|1|6v|4||46*5,7q*20,dn*5,di*10||||1||u2~6v~7q*2,dn*2~5;u3~6v~7q*4,dn*4~6;u4~6v~7q*8,dn*8~7;p4~~an
Vilebone Maulclaws|4|w|2|6v|4||3q*2,ds*2,dc*2,di*4||||1||u2~6v~3q,ds,dc,di*2~5;u3~6v~3q*2,ds*2,dc*2,di*4~6;u4~6v~3q*4,ds*4,dc*4,di*8~7;p4~~an
Wooden Atgeir|4|w|2||||||f4||1|
Black Metal Shield|4|s||6v|3||46*10,dc*8,7k*5||||1||u2~6v~46*10,dc*4,7k*2~4;u3~6v~46*20,dc*8,7k*4~5;p3~~ao
Black Metal Tower Shield|4|s||6v|3||46*15,dc*10,7k*7||||1||u2~6v~46*10,dc*4,7k*2~4;u3~6v~46*20,dc*8,7k*4~5;p3~~ao
Black Metal Missile|4|o||ck||20|z*10,dc||||1||xammo~io
Misty Fishing Bait|4|o||a0||20|5q*20,f4||||1|
Needle Arrow|4|o||3b|4|20|dn*4,l*2||||1||xobliterator~a4
Stingy Fishing Bait|4|o||a0||20|5q*20,f2||||1|
Bracelets of the Brave|4|a|T|6v|||dc*5,dk*5,f4||||1|
Evasion Mantle|4|a|T|6v|||dc*5,f0,di*10||||1|
Linen Cape|4|a|K|3b|2||di*20,b2||||1||u2~3b~di*4~3;u3~3b~di*8~4;u4~3b~di*16~5;p4~~ao
Lox Cape|4|a|K|3b|2||dk*6,b2*2||||1||u2~3b~dk*2~3;u3~3b~dk*4~4;u4~3b~dk*8~5;p4~~ao
Lox Fur Hood|4|a|H|3b|2||dk*4,3v*4,8e*2||||1||u2~3b~dk*2,3v*2,8e~3;u3~3b~dk*4,3v*4,8e*2~4;u4~3b~dk*8,3v*8,8e*4~5;p4~~ao
Lox Fur Jacket|4|a|C|3b|2||dk*5,3v*8,84*2||||1||u2~3b~dk*6,3v*4,84~3;u3~3b~dk*12,3v*8,84*2~4;u4~3b~dk*24,3v*16,84*4~5;p4~~ao
Lox Fur Trousers|4|a|L|3b|2||dk*5,3v*8,84*2||||1||u2~3b~dk*3,3v*4,84~3;u3~3b~dk*6,3v*8,84*2~4;u4~3b~dk*12,3v*16,84*4~5;p4~~ao
Padded Cuirass|4|a|C|6v|2||7q*10,di*20||||2||u2~6v~7q*3,di*10~3;u3~6v~7q*6,di*20~4;u4~6v~7q*12,di*40~5;p4~~ao
Padded Greaves|4|a|L|6v|2||7q*10,di*20||||1||u2~6v~7q*3,di*10~3;u3~6v~7q*6,di*20~4;u4~6v~7q*12,di*40~5;p4~~ao
Padded Helmet|4|a|H|6v|||7q*10,di*15||||1||u2~6v~7q*5,di*10~2;u3~6v~7q*10,di*20~3;u4~6v~7q*20,di*40~4;p4~~ao
Vilebone Cage|4|a|C|6v|2||3q*4,ds*3,di*4||||1||u2~6v~3q*2,ds,di~3;u3~6v~3q*4,ds*2,di*2~4;u4~6v~3q*8,ds*4,di*4~5;p4~~ao
Vilebone Drapes|4|a|L|6v|2||3q*10,ds,di*4||||1||u2~6v~3q*5,ds,di~3;u3~6v~3q*10,ds*2,di*2~4;u4~6v~3q*20,ds*4,di*4~5;p4~~ao
Vilebone Visage|4|a|H|6v|2||3q*5,f6||||1||u2~6v~3q*2~3;u3~6v~3q*4~4;u4~6v~3q*8~5;p4~~ao
Deathsquito Trophy|4|r|||||||||1||xobliterator~a4
Fuling Berserker Trophy|4|r|||||||||1||xobliterator~a4
Fuling Shaman Trophy|4|r|||||||||1||xobliterator~a4
Fuling Trophy|4|r|||||||||1||xobliterator~a4
Growth Trophy|4|r|||||||||1||xobliterator~a4
Lox Trophy|4|r|||||||||1||xobliterator~a4
Thungr Trophy|4|r|||||||||2|Dropped 100% by the combined Zil & Thungr fight in Hildir's Sealed Tower (Plains).
Vile Trophy|4|r|||||||||1|
Yagluth Trophy|4|r|||||||||1||xobliterator~a4
Zil Trophy|4|r|||||||||2|Not on valheim.source.gs; data from valheim.tools
Barley Flour|4|x||cr|||d8||||1|
Egg|4|x|||||||tH1500@cu;ld3;xChest on the bottom floor of the Sealed Tower (Plains)||2|
Fuling Totem|4|x|||||||gFuling Totem;f4||1|
Hildir's Bronze Chest|4|x|||||||||2|Sealed Tower (Plains), dropped by Zil and Thungr. Carry it back to Hildir (it cannot go through a portal) to unlock more of her stock.
Lox Saddle|4|x||3b|||p*10,di*20,dc*15||||1|
Torn Spirit|4|x|||||||||2|
Black Metal Chest|4|S||3b|||z*10,dp*2,dc*6||||1|
Hot Tub|4|S||3b|||z*20,dp*6,7q*10,y*8||||1||Fz
Wisp Fountain|4|S||a7|||y*10,fe||||2|
Pots and Pans|4|E||3b|||7q*5,40*5,dc*5,46*10||e6s||1|
The Queen|5|B||||||il,g8::5|kin;xThe Infested Citadel door is opened with the Sealbreaker||1|
Dvergr Mage|5|C||||||gm:25,fv:50,g::2–14,ig:5|||1|
Dvergr Rogue|5|C||||||gm:25,fv:50,g::2–14,ig:5|||1|
Gjall|5|C||||||ft,ih:30|||1|
Hare|5|C||||||g4,gi::1–2,ii:5|||1|
Mistile|5|C|||||||||1|
Seeker|5|C||||||gk,fy,ik:5|||1|
Seeker Brood|5|C||||||h6:50|||1|
Seeker Soldier|5|C||||||gk,fy::2–3,ij:5,g9|||1|
Tick|5|C||||||fw,im:5|||1|
Bilebag|5|m|||||||||1|
Black Core|5|m|||||||gBlack Core;f7;xStands in (hidden) rooms of Infested Mines (Mistlands) – main source||2|
Black Marble|5|m|||||||gPetrified Bone@hh;xMining/deconstructing Dvergr structures (Mistlands)||1|
Blood Clot|5|m|||||||||1|
Blue Jute|5|m|||||||xBreak Dvergr banners/curtains (Mistlands), also from Anglerfish||2|
Carapace|5|m|||||||||1|
Ceramic Plate|5|m||ck|2|5|fv*5||||2|
Copper Scrap|5|m|||||||gAncient Armour,Ancient Sword@hh;xDvergr wall lanterns and barrels (Mistlands)||1|
Dvergr Extractor|5|m|||||||xBreak Dvergr component crates (Mistlands, angers the Dvergr)||2|
Flametal Battle Idol|5|m|||||||f567||2|
Flametal Protection Idol|5|m|||||||f567||1|
Hare Meat|5|m|||||||||1|
Herbs of the Hidden Hills|6|m|||||||tW180@fj||2|
Hook|5|m|||||||f5||2|
Larva|5|m|||||||||2|Console-only: no in-game source (spawn/give command only), like Riktig Fuling. No links.
Majestic Carapace|5|m|||||||||2|
Mandible|5|m|||||||||1|
Mead Base: Lightfoot|5|m||6y|||gi*2,l*5,h2*5||||1|
Mead Base: Lingering Stamina|5|m||6y|||gh*10,dw*10,h0*10||||1|
Mead Base: Major Healing|5|m||6y|||17*10,fw*4,h6*5||||1|
Mead Base: Minor Eitr|5|m||6y|||17*10,gh*5,h0*2,h2*5||||1|
Mechanical Spring|5|m||ck|||gg,7q*3||||1|
Mushrooms Galore á la Mistlands|6|m||a0|||h4,gx*3,ha,g5||||1|
Refined Eitr|5|m||ir|||gm||||2|
Sap|5|m||it|||||||2|
Scale Hide|5|m|||||||||2|
Sealbreaker Fragment|5|m|||||||xBreak the crystals on black marble altars in Infested Mines (Mistlands)||2|
Seeker Meat|5|m|||||||||1|
Shield Core|5|m||ck|2||fu,4h,fz*5||||1|
Soft Tissue|5|m|||||||gSoft Tissue@hh;xFlesh mounds in Putrid Holes (Ashlands); broken Dvergr crates (Mistlands); Giant-skull nodes (Mistlands)||2|
Uncooked Fish 'n' Bread|5|m||a0|||gu,de*2||||1|
Uncooked Honey Glazed Chicken|5|m||a0|||df,17*3,h0*2||||1|
Uncooked Meat Platter|5|m||a0|||gk,dj,g4||||1|
Uncooked Misthare Supreme|5|m||a0|||g4,h0*3,4t*2||||1|
Uncooked Stuffed Mushroom|5|m||a0|||h2*3,fw,8a*2||||1|
Wisp|5|m|||||||gWisp||2|
Yggdrasil Wood|5|m|||||||gYggdrasil Shoot@e8;xFelling Yggashoots; Ygga shoot props in Dvergr guard towers (Mistlands)||2|Needs a Black Metal Axe or better.|xobliterator~a4
Anglerfish|5|h|||||||bej;xCaught with a Fishing Rod + bait||2|
Pufferfish|5|h|||||||bej;xCaught with a Fishing Rod + bait||2|
Cooked Hare Meat|5|f||38|||g4||||1||aAlternative recipe~a2~g4
Cooked Seeker Meat|5|f||a2|||gk||||1||aAlternative recipe~a2~gk
Fish 'n' Bread|5|f||cq|||gn||||1|
Honey Glazed Chicken|5|f||cq|||go||||1|
Jotun Puffs|5|f|||||||gJotun Puffs||1|
Luminous Larva|5|f|||||||gLuminous Larva||1|
Magecap|5|f|||||||gMagecap||1|
Meat Platter|5|f||cq|||gp||||1|
Misthare Supreme|5|f||cq|||gq||||1|
Mushroom Omelette|5|f||6s|5||fa*3,h0*3||||1|
Royal Jelly|5|f|||||||gRoyal Jelly||1|
Salad|5|f||6s|5|3|h0*3,bb*3,dw*3||||1|
Seeker Aspic|5|f||6s|5|2|gk*2,h2*2,h6*2||||1|
Stuffed Mushroom|5|f||cq|||gr||||1|
Yggdrasil Porridge|5|f||6s|5||gh*4,d8*3,h6*2||||1|
Lightfoot Mead|5|d||6u|||ga||||1|
Lingering Stamina Mead|5|d||6u|||gb||||1|
Major Healing Mead|5|d||6u|||gc||||1|
Minor Eitr Mead|5|d||6u|||gd||f7||1|
Arbalest|5|w|b|ip|||z*10,7q*8,84*4||||1||u2~ip~z*5,7q*4,84~2;u3~ip~z*10,7q*8,84*2~3;u4~ip~z*20,7q*16,84*4~4;p4~~da
Bile Bomb|5|w|1|3b||3|gh,ft,u*3||||1|
Black Metal Pickaxe|5|w|2|6v|2||gt*3,dc*25||||1||u2~6v~gt,dc*15~3;u3~6v~gt*2,dc*30~4;u4~6v~gt*4,dc*60~5;p4~~an
Carapace Spear|5|w|1|ip|||gt*10,fy*4,g9*2||||1||u2~ip~gt*5,fy*4,g9~2;u3~ip~gt*10,fy*8,g9*2~3;u4~ip~gt*20,fy*16,g9*4~4;p4~~da
Dead Raiser|5|w|2|is|||3v*10,gg*16,6h*4||||1||u2~is~3v*5,gg*8,6h*2~2;u3~is~3v*10,gg*16,6h*4~3;u4~is~3v*20,gg*32,6h*8~4;p4~~da
Demolisher|5|w|2|ip|||gt*10,7q*20,gg*10||||1||u2~ip~gt*2,7q*15,gg*2~2;u3~ip~gt*4,7q*30,gg*4~3;u4~ip~gt*8,7q*60,gg*8~4;p4~~da
Dvergr Lantern|5|w|t|ip|||3w*2,4h,ap||gDvergr Lantern||1|
Dvergr Tankard|5|w|1||||||gDvergr Tankard||1|
Grappling Hook|5|w|b|ip|||gt*10,gg*10,g9*4,g6||||1|
Himminafl|5|w|2|ip|||gt*10,gg*15,b2*5,g9*2||||1||u2~ip~gg*15,b2*5,g9*2~2;u3~ip~gg*30,b2*10,g9*4~3;u4~ip~gg*60,b2*20,g9*8~4;p4~~da
Jotun Bane|5|w|1|ip|||gt*5,7q*15,ft*3,gg*10||||1||u2~ip~7q*10,ft,gg~2;u3~ip~7q*20,ft*2,gg*2~3;u4~ip~7q*40,ft*4,gg*4~4;p4~~an
Krom|5|w|2|ip|||7q*30,3w*20,gi*5||||1||u2~ip~7q*15,3w*10,gi*5~2;u3~ip~7q*30,3w*20,gi*10~3;u4~ip~7q*60,3w*40,gi*20~4;p4~~da
Mistwalker|5|w|1|ip|||46*3,7q*15,gg*10,gs*3||||1||u2~ip~7q*10,gg*5,gs~2;u3~ip~7q*20,gg*10,gs*2~3;u4~ip~7q*40,gg*20,gs*4~4;p4~~da
Skoll and Hati|5|w|2|ip|||46*4,7q*10,dc*10||||1||u2~ip~7q*4,dc*4~2;u3~ip~7q*8,dc*8~3;u4~ip~7q*16,dc*16~4;p4~~an
Skull Splittur|5|w|2|ip|||7q*30,gt*15,gg*10||||1||u2~ip~7q*15,gt*5~2;u3~ip~7q*30,gt*10~3;u4~ip~7q*60,gt*20~4;p4~~da
Spinesnap|5|w|b|ip|||46*10,3v*40,gg*10||||1||u2~ip~46*5,3v*20~2;u3~ip~46*10,3v*40~3;u4~ip~46*20,3v*80~4;p4~~da
Staff of Embers|5|w|2|is|||gt*20,4h*4,gg*16||||1||u2~is~gt*10,4h*2,gg*8~2;u3~is~gt*20,4h*4,gg*16~3;u4~is~gt*40,4h*8,gg*32~4;p4~~da
Staff of Frost|5|w|2|is|||gt*20,at*4,gg*16||||1||u2~is~gt*10,at*2,gg*8~2;u3~is~gt*20,at*4,gg*16~3;u4~is~gt*40,at*8,gg*32~4;p4~~da
Staff of Protection|5|w|2|is|||gt*20,fw*4,gg*16||||1||u2~is~gt*10,fw*2,gg*8~2;u3~is~gt*20,fw*4,gg*16~3;u4~is~gt*40,fw*8,gg*32~4;p4~~da
Wooden Greatsword|5|w|2||||||f5||1|
Carapace Buckler|5|s||ip|||fy*16,gi*3,gg*10||||1||u2~ip~fy*8,gi*3,gg*3~2;u3~ip~fy*16,gi*6,gg*6~3;p3~~db
Carapace Shield|5|s||ip|||fy*20,gi*3,gg*10||||1||u2~ip~fy*10,gi*3,gg*3~2;u3~ip~fy*20,gi*6,gg*6~3;p3~~db
Black Metal Bolt|5|o||ip|2|20|dc*2,z*8,l*2||||1||xobliterator~a4
Bone Bolt|5|o||ip||20|3v*8,l*2||||1||xobliterator~a4
Carapace Arrow|5|o||ip||20|fy*4,l*2,z*8||f6||1||xobliterator~a4
Carapace Bolt|5|o||ip||20|fy*2,z*8,l*2||||1||xobliterator~a4
Iron Bolt|5|o||ip||20|z*8,7q,l*2||||1|
Carapace Breastplate|5|a|C|ip|||fy*20,gi*3,7q*5,gg*4||||2||u2~ip~fy*10,gi,gg*2~2;u3~ip~fy*20,gi*2,gg*4~3;u4~ip~fy*40,gi*4,gg*8~4;p4~~db
Carapace Greaves|5|a|L|ip|||fy*20,gi*3,7q*5,gg*4||||1||u2~ip~fy*10,gi,gg*2~2;u3~ip~fy*20,gi*2,gg*4~3;u4~ip~fy*40,gi*4,gg*8~4;p4~~db
Carapace Helmet|5|a|H|ip|||fy*16,gi*3,g9*2,gg*4||||1||u2~ip~fy*8,gi,gg*2~2;u3~ip~fy*16,gi*2,gg*4~3;u4~ip~fy*32,gi*4,gg*8~4;p4~~db
Eitr-weave Hood|5|a|H|is|||di*16,gg*15,7q*2||||1||u2~is~di*8,gg*5~2;u3~is~di*16,gg*10~3;u4~is~di*32,gg*20~4;p4~~db
Eitr-weave Robe|5|a|C|is|||di*20,gg*20,l*10,gi*5||||1||u2~is~di*10,gg*5~2;u3~is~di*20,gg*10~3;u4~is~di*40,gg*20~4;p4~~db
Eitr-weave Trousers|5|a|L|is|||di*20,gg*20,gi*10||||1||u2~is~di*10,gg*5~2;u3~is~di*20,gg*10~3;u4~is~di*40,gg*20~4;p4~~db
Feather Cape|5|a|K|is|||l*10,gi*5,gg*20||||1||u2~is~l*2,gi*5,gg*3~2;u3~is~l*4,gi*10,gg*6~3;u4~is~l*8,gi*20,gg*12~4;p4~~db
Pulsating Earrings|5|a|T|ip|||fy*5,gg*5,ih||||1|
Resounding Shackle|5|a|T|ip|||gg*5,gi*5,g9,ik||||1|
Wisplight|5|a|U|3b|||b2,gs||||2|
Dvergr Trophy|5|r|||||||||1||xobliterator~a4
Gjall Trophy|5|r|||||||||1||xobliterator~a4
Hare Trophy|5|r|||||||||1||xobliterator~a4
Seeker Soldier Trophy|5|r|||||||||1||xobliterator~a4
Seeker Trophy|5|r|||||||||1||xobliterator~a4
The Queen Trophy|5|r|||||||||1|
Tick Trophy|5|r|||||||||1||xobliterator~a4
Sealbreaker|5|x||is|||gj*9||||2|
Ballista|5|S||3b|||dc*10,gt*10,ge*3||||2|Ammo: Wooden Missile, Black Metal Missile, Flametal Missile, Bloodgold Missile.
Black Forge|5|S||3b|||fv*10,gt*10,fu*5||||2|
Drakkar|5|S||3b|||7r*100,fz*30,46*50,gt*25||||2|
Eitr Refinery|5|S||3b|||fv*20,dc*5,gt*10,fu*5,gh*3||||2||Fgh
Galdr Table|5|S||3b|||gt*20,dc*10,fu*5,gg*5||||2|
Sap Extractor|5|S||3b|||gt*10,dc*5,g1||||1|
Shield Generator|5|S||3b|||7q*5,40*5,gl||||1||F3v;Fjv
Trap|5|S||3b|||dc*5,3x*10,ge||||1|
Artisan Press|5|E||ck|||fv*5,3w*5,g8||eck||1|
Black Forge Cooler|5|E||ip|||7q*5,40*5,fv*4||eip||1|
Mortar and Pestle|5|E||3b|||fv*8,46*6,42*4||e6s||1|
Rune Table|5|E||is|||fv*10,gt*5,gg*10||eis||1|
Unfading Candles|5|E||is|||fv*10,6h*3,gg*10,u*15||eis||1|
Vice|5|E||ip|||7q*5,40*8,ge*2||eip||1|
Fader|6|B|||||n1*3|mr,ka::5|||2|
Lord Reto|6|M||||||jz|||1|
Ash Crow|6|C||||||l:100:3|||2|
Asksvin|6|C||||||mp:10,ji,jj::2,jo::2||l2,kr,kz|1|
Asksvin Hatchling|6|C||||||ji:20,jj:20,jo:20|||1|
Bonemaw|6|C||||||mq:33,jr::6–7,js::8–9|||1|
Charred Marksman|6|C||||||jv::1–2,mu:5|||1|
Charred Twitcher|6|C||||||jv|||1|
Charred Warlock|6|C||||||jv::1–2,mx:5|||1|
Charred Warrior|6|C||||||jv::1–2,my:5|||1|
Fallen Valkyrie|6|C||||||jt::2–3,ms:5|||1|
Lava Blob|6|C||||||kh,ki,mt:10|||1|
Morgen|6|C||||||kf,ke:80,mv:5|||1|
Volture|6|C||||||mw:10,km,l:50:2,n2:50|||1|
Ashlands Gourmet Bowl|7|m||a0|||ko*3,l2*5,kx*2,k3||||1|
Ashwood|6|m|||||||gScorched Tree;f6||2|
Asksvin Bladder|6|m|||||||||1|
Asksvin Hide|6|m|||||||||1|
Asksvin Neck|6|m|||||||xBreak asksvin carrion at Morgen Holes (2% per roll)||2|
Asksvin Pelvis|6|m|||||||xBreak asksvin carrion at Morgen Holes (2% per roll)||2|
Asksvin Ribcage|6|m|||||||xBreak asksvin carrion at Morgen Holes (2% per roll)||2|
Asksvin Skull|6|m|||||||xBreak asksvin carrion at Morgen Holes (2% per roll)||2|
Asksvin Tail|6|m|||||||||1|
Bell Fragment|6|m|||||||xDestroy the bell altar in a Charred Fortress (2–4)||2|
Bloodstone|6|m|||||||gBloodstone;f6||1|
Bonemaw Meat|6|m|||||||||1|
Bonemaw Tooth|6|m|||||||||1|
Celestial Feather|6|m|||||||f6||1|
Charcoal Resin|6|m|||||||gScorched Tree||1|
Charred Bone|6|m|||||||f6||2|
Charred Cogwheel|6|m|||||||xDropped by Skugg and from destroyed charred ballistae in Charred Fortresses||2|
Charred Skull|6|m|||||||gCharred Skull;f6||1|
Dyrnwyn Blade Fragment|6|m|||||||gDyrnwyn Blade Fragment||1|
Dyrnwyn Hilt Fragment|6|m|||||||gDyrnwyn Hilt Fragment||1|
Dyrnwyn Tip Fragment|6|m|||||||gDyrnwyn Tip Fragment||1|
Embers|6|m|||||||gEmbers||2|
Explosive Payload|6|m||3b||5|jj*2,ki*2,kh*3||||1||xammo~n5
Fiery Spice Powder|7|m|||||||tW200@j2||2|
Flametal|6|m||cl|||k5||||2|
Flametal Ore|6|m|||||||gFlametal Ore@hh;f6||2|
Grausten|6|m|||||||gGrausten||1|
Grausten Payload|6|m||3b||5|k6*10||||1||xammo~n5
Iolite|6|m|||||||gIolite;f6||1|
Jade|6|m|||||||gJade;f6||1|
Kindled Ribs|6|m|||||||||2|
Mead Base: Lingering Eitr|6|m||6y|||gh*10,l2*10,h2*10||||1|
Mead Base: Lingering Health|6|m||6y|||gh*10,l2*10,kz*10||||1|
Molten Core|6|m|||||||gMolten Core;f6||1|
Morgen Heart|6|m|||||||||1|
Morgen Sinew|6|m|||||||||1|
Pot Shard|6|m|||||||gPot Shard||1|
Proustite Powder|6|m|||||||||1|
Sulfur|6|m|||||||gSulfur Rock||1|
Uncooked Piquant Pie|6|m||a0|||l2*2,jo*2,f9*4||||1|
Uncooked Roasted Crust Pie|6|m||a0|||l2*2,n2,f9*4||||1|
Vineberry Seeds|6|m|||||||gVineberry Cluster||1|
Volture Meat|6|m|||||||||1|
Magmafish|6|h|||||||bmb;xAshlands (Hot Fishing Bait costs one Warrior Trophy per 20)||2|
Cooked Asksvin Tail|6|f||a2|||jo||||1||aAlternative recipe~a2~jo
Cooked Bonemaw Meat|6|f||a2|||jr||||1||aAlternative recipe~a2~jr
Cooked Volture Meat|6|f||a2|||km||||1||aAlternative recipe~a2~km
Fiddlehead|6|f|||||||gFiddlehead||1|
Fiery Svinstew|6|f||6s|5||jo,l2*2,kz||||1|
Marinated Greens|6|f||6s|6||gh*3,h2*2,kr*2,kz*2||||1|
Mashed Meat|6|f||6s|6||jo,km,kr||||1|
Piquant Pie|6|f||cq|||kj||||1|
Roasted Crust Pie|6|f||cq|||kk||||1|
Scorching Medley|6|f||6s|6|3|h0*3,bb*3,kr*3||||1|
Sizzling Berry Broth|6|f||6s|5||gh*3,kr*2,l2*2||||1|
Smoke Puff|6|f|||||||gSmoke Puff||1|
Sparkling Shroomshake|6|f||6s|6||gh*4,l2*2,kz*2,h2*2||||1|
Spicy Marmalade|6|f||6s|5||l2*3,17,kr||||1|
Vineberry Cluster|6|f|||||||gVineberry Cluster||1|
Lingering Eitr Mead|6|d||6u|||kb||||1|
Lingering Healing Mead|6|d||6u|||kc||||1|
Ash Fang|6|w|b|ip|3||jh*10,jv*16,k4*5,js*5||||1||u2~ip~jh*5,jv*10,k4*5,js*5~4;u3~ip~jh*10,jv*20,k4*10,js*10~5;u4~ip~jh*20,jv*40,k4*20,js*20~6;p4~~g2
Basalt Bomb|6|w|1|3b||5|jj,ji,kh*3||||1|
Berserkir Axes|6|w|2|ip|3||jv*15,k4*24,jj*3||||1||u2~ip~k4*15,jj~4;u3~ip~k4*30,jj*2~5;u4~ip~k4*60,jj*4~6;p4~~g2
Bleeding Berserkir Axes|6|w|2|ip|4||l7,k4*5,jq||||1||u2~ip~k4*5,jq~5;u3~ip~k4*10,jq*2~6;u4~ip~k4*20,jq*4~7;p4~~g2
Blob Bomb: Lava|6|w|1|3b|||43,ki*10,kh*10||||1|
Blood Fang|6|w|b|ip|4||l5,k4*5,jq||||1||u2~ip~k4*5,jq~5;u3~ip~k4*10,jq*2~6;u4~ip~k4*20,jq*4~7;p4~~g2
Bloodgeon|6|w|1|ip|4||lf,k4*8,jq||||1||u2~ip~k4*8,jq~5;u3~ip~k4*16,jq*2~6;u4~ip~k4*32,jq*4~7;p4~~g2
Brutal Slayer|6|w|2|ip|4||lr,k4*15,jq||||1||u2~ip~k4*15,jq~5;u3~ip~k4*30,jq*2~6;u4~ip~k4*60,jq*4~7;p4~~g2
Dundr|6|w|2|is|2||jh*10,k4*4,jt*3,jq||||1||u2~is~jh*5,k4*2,jt*3,jq~3;u3~is~jh*10,k4*4,jt*6,jq*2~4;u4~is~jh*20,k4*8,jt*12,jq*4~5;p4~~g2
Dyrnwyn|6|w|1|ip|4||jz,jy,k0,k4*20,jq||||1||u2~ip~k4*10,jq~5;u3~ip~k4*20,jq*2~6;u4~ip~k4*40,jq*4~7;p4~~g2
Flametal Mace|6|w|1|ip|3||jv*10,k4*15,ki*5,jj*3||||1||u2~ip~jv*5,k4*8,ki*3,jj*2~4;u3~ip~jv*10,k4*16,ki*6,jj*4~5;u4~ip~jv*20,k4*32,ki*12,jj*8~6;p4~~g2
Klossen|6|w|1|ip|4||lf,k4*8,k9||||1||u2~ip~k4*8,k9~5;u3~ip~k4*16,k9*2~6;u4~ip~k4*32,k9*4~7;p4~~g2
Nidhögg|6|w|1|ip|3||jv*3,k4*12,jj*2||||1||u2~ip~k4*10,jj*2~4;u3~ip~k4*20,jj*4~5;u4~ip~k4*40,jj*8~6;p4~~g2
Nidhögg the Bleeding|6|w|1|ip|4||lh,k4*6,jq||||1||u2~ip~k4*6,jq~5;u3~ip~k4*12,jq*2~6;u4~ip~k4*24,jq*4~7;p4~~g2
Nidhögg the Primal|6|w|1|ip|4||lh,k4*6,k9||||1||u2~ip~k4*6,k9~5;u3~ip~k4*12,k9*2~6;u4~ip~k4*24,k9*4~7;p4~~g2
Nidhögg the Thundering|6|w|1|ip|4||lh,k4*6,k8||||1||u2~ip~k4*6,k8~5;u3~ip~k4*12,k8*2~6;u4~ip~k4*24,k8*4~7;p4~~g2
Primal Berserkir Axes|6|w|2|ip|4||l7,k4*5,k9||||1||u2~ip~k4*5,k9~5;u3~ip~k4*10,k9*2~6;u4~ip~k4*20,k9*4~7;p4~~g2
Primal Slayer|6|w|2|ip|4||lr,k4*15,k9||||1||u2~ip~k4*15,k9~5;u3~ip~k4*30,k9*2~6;u4~ip~k4*60,k9*4~7;p4~~g2
Ripper|6|w|b|ip|3||jh*10,k4*8,kf*2,js*4||||1||u2~ip~jh*5,k4*4,kf,js*4~4;u3~ip~jh*10,k4*8,kf*2,js*8~5;u4~ip~jh*20,k4*16,kf*4,js*16~6;p4~~g2
Root Fang|6|w|b|ip|4||l5,k4*5,k9||||1||u2~ip~k4*5,k9~5;u3~ip~k4*10,k9*2~6;u4~ip~k4*20,k9*4~7;p4~~g2
Root Ripper|6|w|b|ip|4||ln,k4*8,k9||||1||u2~ip~k4*8,k9~5;u3~ip~k4*16,k9*2~6;u4~ip~k4*32,k9*4~7;p4~~g2
Scourging Slayer|6|w|2|ip|4||lr,k4*15,k8||||1||u2~ip~k4*15,k8~5;u3~ip~k4*30,k8*2~6;u4~ip~k4*60,k8*4~7;p4~~g2
Slayer|6|w|2|ip|3||k4*30,jj*5,kf*3||||2||u2~ip~k4*15,jj*5,kf*3~4;u3~ip~k4*30,jj*10,kf*6~5;u4~ip~k4*60,jj*20,kf*12~6;p4~~g2
Smoke Bomb|6|w|1|3b||10|kz,ji||||1|
Snow Shovel|6|w|2|ip|3||46*5,k4*4,k1*2||||1||u2~ip~46,k4*10~4;u3~ip~46*2,k4*20~5;p3~~10
Splitnir|6|w|1|ip|3||jh*10,k4*6,jj*2,js*3||||1||u2~ip~jh*5,k4*6,jj,js*3~4;u3~ip~jh*10,k4*12,jj*2,js*6~5;u4~ip~jh*20,k4*24,jj*4,js*12~6;p4~~da
Splitnir the Bleeding|6|w|1|ip|4||lu,k4*6,jq||||1||u2~ip~k4*6,jq~5;u3~ip~k4*12,jq*2~6;u4~ip~k4*24,jq*4~7;p4~~da
Splitnir the Primal|6|w|1|ip|4||lu,k4*6,k9||||1||u2~ip~k4*6,k9~5;u3~ip~k4*12,k9*2~6;u4~ip~k4*24,k9*4~7;p4~~da
Splitnir the Storming|6|w|1|ip|4||lu,k4*6,k8||||1||u2~ip~k4*6,k8~5;u3~ip~k4*12,k8*2~6;u4~ip~k4*24,k8*4~7;p4~~da
Staff of Fracturing|6|w|2|is|2||jv*15,jh*5,kh*8||||1||u2~is~jv*5,jh*3,kh~3;u3~is~jv*10,jh*6,kh*2~4;u4~is~jv*20,jh*12,kh*4~5;p4~~g2
Staff of the Wild|6|w|2|is|2||jh*15,kr*10,jt*3,k9||||1||u2~is~jh*5,kr*2,jt*3,k9~3;u3~is~jh*10,kr*4,jt*6,k9*2~4;u4~is~jh*20,kr*8,jt*12,k9*4~5;p4~~g2
Storm Fang|6|w|b|ip|4||l5,k4*5,k8||||1||u2~ip~k4*5,k8~5;u3~ip~k4*10,k8*2~6;u4~ip~k4*20,k8*4~7;p4~~g2
Storm Ripper|6|w|b|ip|4||ln,k4*8,k8||||1||u2~ip~k4*8,k8~5;u3~ip~k4*16,k8*2~6;u4~ip~k4*32,k8*4~7;p4~~g2
Storm Star|6|w|1|ip|4||lf,k4*8,k8||||1||u2~ip~k4*8,k8~5;u3~ip~k4*16,k8*2~6;u4~ip~k4*32,k8*4~7;p4~~g2
Thundering Berserkir Axes|6|w|2|ip|4||l7,k4*5,k8||||1||u2~ip~k4*5,k8~5;u3~ip~k4*10,k8*2~6;u4~ip~k4*20,k8*4~7;p4~~g2
Trollstav|6|w|2|is|2||jv*15,6j,k4*3,jq||||1||u2~is~jv*5,6j,k4*3,jq~3;u3~is~jv*10,6j*2,k4*6,jq*2~4;u4~is~jv*20,6j*4,k4*12,jq*4~5;p4~~g2
Wound Ripper|6|w|b|ip|4||ln,k4*8,jq||||1||u2~ip~k4*8,jq~5;u3~ip~k4*16,jq*2~6;u4~ip~k4*32,jq*4~7;p4~~g2
Flametal Shield|6|s||ip|3||jh*10,k4*8,jj*2||||1||u2~ip~jh*10,k4*4,jj*2~4;u3~ip~jh*20,k4*8,jj*4~5;p3~~g3
Flametal Tower Shield|6|s||ip|3||jh*15,k4*10,jj*5||||1||u2~ip~jh*10,k4*4,jj*2~4;u3~ip~jh*20,k4*8,jj*4~5;p3~~g3
Charred Arrow|6|o||ip||20|jv*4,l*2,jh*8||f7||2|
Charred Bolt|6|o||ip||20|jv*2,jh*8,l*2||f7||2|
Flametal Missile|6|o||ck||20|jh*10,k4||||1||xammo~io
Hot Fishing Bait|6|o||a0||20|5q*20,my||||1|
Ashen Cape|6|a|K|ip|3||jj*6,kf*2,k4*5||||2||u2~ip~jj*2~4;u3~ip~jj*4~5;u4~ip~jj*8~6;p4~~g3
Asksvin Cloak|6|a|K|is|2||jj*6,kf*2||||1||u2~is~jj*2~3;u3~is~jj*4~4;u4~is~jj*8~5;p4~~g3
Breastplate of Ask|6|a|C|ip|3||di*15,dk*4,jj*10||||2||u2~ip~di*10,dk*2,jj*5~4;u3~ip~di*20,dk*4,jj*10~5;u4~ip~di*40,dk*8,jj*20~6;p4~~g3
Brimstone|6|a|T|ip|||k4*5,ki*5,kd,mv||||1|
Flametal Breastplate|6|a|C|ip|3||k4*20,jj*3,jv*5,ke||||2||u2~ip~k4*10,jj~4;u3~ip~k4*20,jj*2~5;u4~ip~k4*40,jj*4~6;p4~~g3
Flametal Greaves|6|a|L|ip|3||k4*20,jj*3,jv*5||||1||u2~ip~k4*10,jj~4;u3~ip~k4*20,jj*2~5;u4~ip~k4*40,jj*4~6;p4~~g3
Flametal Helmet|6|a|H|ip|3||k4*16,jj*3,jv*2,gg*4||||1||u2~ip~k4*8,jj,gg*2~4;u3~ip~k4*16,jj*2,gg*4~5;u4~ip~k4*32,jj*4,gg*8~6;p4~~g3
Hood of Ask|6|a|H|ip|3||di*15,dk*4,jj*10||||1||u2~ip~di*10,dk*2,jj*5~4;u3~ip~di*20,dk*4,jj*10~5;u4~ip~di*40,dk*8,jj*20~6;p4~~g3
Hood of Embla|6|a|H|is|2||di*16,gg*15,jj*2||||1||u2~is~di*8,gg*5~3;u3~is~di*16,gg*10~4;u4~is~di*32,gg*20~5;p4~~g3
Jörmundling|6|a|T|ip|||k4*5,gg*5,jq,ms||||1|
Robes of Embla|6|a|C|is|2||di*20,gg*20,jj*10,k4*5||||2||u2~is~di*10,gg*5,k4*2~3;u3~is~di*20,gg*10,k4*4~4;u4~is~di*40,gg*20,k4*8~5;p4~~g3
Trousers of Ask|6|a|L|ip|3||di*15,dk*4,jj*10||||1||u2~ip~di*10,dk*2,jj*5~4;u3~ip~di*20,dk*4,jj*10~5;u4~ip~di*40,dk*8,jj*20~6;p4~~g3
Trousers of Embla|6|a|L|is|2||di*20,gg*20,jj*10||||1||u2~is~di*10,gg*5~3;u3~is~di*20,gg*10~4;u4~is~di*40,gg*20~5;p4~~g3
Asksvin Trophy|6|r|||||||||1|
Bonemaw Trophy|6|r|||||||||1|
Fader Trophy|6|r|||||||||1|
Fallen Valkyrie Trophy|6|r|||||||||1|
Lava Blob Trophy|6|r|||||||||1|
Marksman Trophy|6|r|||||||||1|
Morgen Trophy|6|r|||||||||1|
Volture Trophy|6|r|||||||||1|
Warlock Trophy|6|r|||||||||1|
Warrior Trophy|6|r|||||||||1|
Asksvin Egg|6|x|||||||lj5||1|
Asksvin Saddle|6|x||ip|2||k4*6,di*20,kf*4||||1|
Bell|6|x||ip|||jp*3||||2|
Volture Egg|6|x|||||||gVolture Egg||1|
Ashwood Bed|6|S||3b|||jh*8,dk*2,jj*2||||1|
Battering Ram|6|S||3b|||jh*20,k4*10,4h*2||||1||Fz;F46;F42;Fjh
Catapult|6|S||3b|||jh*20,k4*10,jw||||2|Ammo: Grausten Payload, Explosive Payload, Bloodgold Payload.
Eternal Pyre|6|S||a7|||y*10,ka||||2|
Grausten Chest|6|S||3b|||k6*10,my*5,k4*2||||1|
Portal – Stone|6|S||a7|||48*10,k6*30,kd*2||||1|
Feathery Wreath|6|E||is|||jt*8,mp,gg*10,jh*3||eis||1|
Gem Cutter|6|E||ip|||k4*5,jh*8,kf*2,jq||eip||1|
Metal Cutter|6|E||ip|||fv*5,k4*5,jh*5,jv*4||eip||1|
Rolling Pins and Cutting Boards|6|E||3b|||jh*8,46*6,k4*4||e6s||1|
Kall Fimbulbringer|7|B|||||sr*3|pq,ob|||2|
Aspect of the Crawling Matriarch|7|C|||||||||1|
Aspect of the Dragon Mother|7|C|||||||||1|
Aspect of the Emerald Flame|7|C|||||||||1|
Aspect of the Lightning Stag|7|C|||||||||1|
Aspect of the Living Forest|7|C|||||||||1|
Aspect of the Twisted Soul|7|C|||||||||1|
Aspect of the Writhing Dead|7|C|||||||||1|
Baby Seal|7|C||||||pr:10|||2|
Barka|7|C||||||sh:10,og|||2|
Captive Fuling|7|C||||||g:25:20–40,o6:100:1–2,q8:20:1–10|||2|Morkhalla dungeon, Deep North (valheim.tools); the CSV had Plains
Elaking|7|C||||||oe,si:10,ox:20|||2|
Eyeless One|7|C||||||sj:10,om,ox:50|||2|
Fallen Warrior|7|C||||||of:50,pw:50|||2|
Frost Blob|7|C||||||ap,sk:10|||2|
Frost Wisp|7|C||||||p:50|||2|Not on valheim.source.gs; data from valheim.tools
Frysling|7|C||||||au:100:1|||2|Not on valheim.source.gs; data from valheim.tools
Gammeltroll|7|C|||||||||2|
Hexen|7|C||||||pk::1–3,sl:10,sq:10,pf:5,ou:5,ph:5|||2|
Imprisoned Dvergr|7|C||||||g:100:10–20,ig:5,od:10,oh:10,pv:10,q0:10|||2|
Krigen|7|C||||||os:3,ow:3,pj:3,on:20,sm:10,ok::1–3,pi:3,or:3,ov:3|||2|
Moose|7|C||||||op::4–6,sn:10,oo::2–3,oq::2–3||q8|2|
Moose Calf|7|C|||||||||2|
Seal|7|C||||||ps::2–3,sp:10,pr::2–3|||2|
Shadow|7|C|||||||||2|
Shapeless Pulp|7|C||||||so:10|||2|source.gs lists only Pulp Trophy; Tiny Pulp is a creature that splits off, not an item; Dead Pulp comes from Tiny Pulp (25%).
Tendril|7|C|||||||||2|
The Void|7|C||||||45:50:1–2,rt::1|||2|Second variant drops Voidcaller (source.gs).
Tiny Pulp|7|C||||||oc:25|||2|
Ancient Coin|7|m|||||||f7;v10||2|
Bloodgold|7|m||cl|||po||||2|
Bloodgold Battle Idol|7|m|||||||f7;xRare chest loot (~0.2% / 0.36% per roll): Mörkhalla Ancient Chests, Jotun's Chests, North Village chests, Ship Setting / Ship Wreck chests (Deep North)||2|
Bloodgold Payload|7|m||ip||5|oi*2,o7*2,kh*3||||2||xammo~n5
Bloodgold Protection Idol|7|m|||||||f7;xRare chest loot (~0.2% / 0.36% per roll): Mörkhalla Ancient Chests, Jotun's Chests, North Village chests, Ship Setting / Ship Wreck chests (Deep North)||2|
Crown Jewel|7|m|||||||||2|
Dead Pulp|7|m|||||||||2|
Draumyx|7|m|||||||gDraumyx;f7;v175||2|
Elaking Hair Bundle|7|m|||||||||2|
Frostfire Essence|7|m|||||||||2|
Frozen Branch|7|m|||||||||2|
Grimvarn|7|m|||||||gGrimvarn;f7;v55||2|
Ice|7|m|||||||gBlack Ice Shards,Frozen corpses||2|
Kale Seeds|7|m|||||||gKale Seeds||2||xplant~q6
Leather Straps|7|m|||||||||2|
Liquid Frost|7|m||su|||oi*5||||2|
Long Claws|7|m|||||||||2|
Memorial Coal|7|m|||||||||2|
Moose Hide|7|m|||||||xBreaking bedrolls in Mörkhalla||2|
Moose Meat|7|m|||||||||2|
Moose Sinew|7|m|||||||||2|
Mould: Breastplate of the Protector|7|m|||||||||2|
Mould: Chestpiece of the Vanguard|7|m|||||||||2|
Mould: Echo Spike|7|m|||||||f7||2|
Mould: Headdress of the Caller|7|m|||||||||2|
Mould: Helmet of the Protector|7|m|||||||||2|
Mould: Hood of the Vanguard|7|m|||||||||2|
Mould: Intricate Key|7|m|||||||xAlso 6.5% from rubble in the Winding Tunnels||2|
Mould: Lightning Strike|7|m|||||||f7||2|
Mould: Nord Atgeir|7|m|||||||f7||2|
Mould: Nord Axe|7|m|||||||f7||2|
Mould: Nord Bow|7|m|||||||f7||2|
Mould: Nord Buckler|7|m|||||||f7||2|
Mould: Nord Crossbow|7|m|||||||f7||2|
Mould: Nord Dagger|7|m|||||||f7||2|
Mould: Nord Greataxe|7|m|||||||f7||2|
Mould: Nord Greatshield|7|m|||||||f7||2|
Mould: Nord Greatsword|7|m|||||||f7||2|
Mould: Nord Knucklechains|7|m|||||||f7||2|
Mould: Nord Mace|7|m|||||||f7||2|
Mould: Nord Shield|7|m|||||||f7||2|
Mould: Nord Sledge|7|m|||||||f7||2|
Mould: Nord Spear|7|m|||||||f7||2|
Mould: Nord Sword|7|m|||||||f7||2|
Mould: Northern Vengeance|7|m|||||||f7||2|
Mould: Robes of the Caller|7|m|||||||||2|
Mould: Spirit Caller|7|m|||||||f7||2|
Mould: Trousers of the Caller|7|m|||||||||2|
Mould: Trousers of the Protector|7|m|||||||||2|
Mould: Trousers of the Vanguard|7|m|||||||||2|
Nornathread|7|m|||||||||2|
Northern Morning Fare|7|m||a0|||q3*3,qh*5,st*2,pt||||2|
Oat Seeds|7|m|||||||gOat Seeds||2|
Oven Pancake Batter|7|m||6s|6||op,qh*2,q8*2,st*2||||2|
Petrified Tissue|7|m|||||||gPetrified Gammeltroll@hh||2|
Raw Kale Chips|7|m||6s|6|4|q6*12||||2|
Sacrificial Blood|7|m|||||||||2|
Seal Blubber|7|m|||||||||2|
Seal Pelt|7|m|||||||||2|
Seasoning of the Gourd|7|m|||||||tW220@nd||2|
Seed Poteitr|7|m|||||||gPoteitr||2||xplant~qh
Solryth|7|m|||||||gSolryth;f7;v95||2|
Thunderblood Essence|7|m|||||||||2|
Timberwood|7|m|||||||gBranch,Timber Tree||2|
Timberwood Cone|7|m|||||||gTimber Tree||2|
Unbaked Poteitr|7|m||6s|7||pr,q6*2,qh,st*2||||2|
Veydris|7|m|||||||gVeydris;f7;v135||2|
Northern Salmon|7|h|||||||bbv;xDeep North (Frosty Fishing Bait, made with a Drake Trophy)||2|
Baked Poteitr|7|f||cq|||pz||||2|
Cooked Moose Meat|7|f||a2|||op||||2||aAlternative recipe~a2~op
Cooked Seal Blubber|7|f||cq|||pr||||2|
Fish Soup|7|f||6s|7||83*3,q6*2,oi*2||||2|
Kale|7|f|||||||gKale||2|
Kale Chips|7|f||cq|||pp||||2|
Lingonberries|7|f|||||||gLingonberries||2|
Lingonberry Juice|7|f||6s|6||q8*5,oi*5||||2|
Meat In Bread|7|f||6s|7|2|op,q6*2,st,q8*2||||2|
Meatballs and Poteitr|7|f||6s|7||op,q8*2,qh*2||||2|
Oat Milk|7|f||6y|||qe*5,oi*5||||2|
Oatmeal|7|f||6s|6||qe*2,q8*2,qc||||2|
Oats|7|f||cr|||pm||||2|
Oven Pancake|7|f||cq|||pn||||2|
Pancakes|7|f||6s|6|3|qc,st*2,fa*2,4r*2||||2|
Poteitr|7|f|||||||gPoteitr||2|
Seal Meat Soup|7|f||6s|7||pr*2,q6*2,oi*2||||2|
Smoked Fish|7|f||6s|7||83,q6,qh||||2|
Smoked Moose Meat|7|f||6s|7||op,q6*2||||2|
Blob Bomb: Pulp|7|w|1|3b|||43,so,oc*3||||1|
Echo Spike|7|w|2|cn|||tq||||1|Two steps: Galdr Table L3 → Cast: Echo Spike, then Frost Foundry.|p4~~o8
Ember Charge|7|w|1|3b||10|ps*2,k1||||1|
Frostfire Atgeir|7|w|2|ip|4||r1,o7*20,of||||1||u2~ip~o7*10,of~5;u3~ip~o7*20,of*2~6;u4~ip~o7*40,of*4~7;p4~~o8
Frostfire Axe|7|w|1|ip|4||r2,o7*20,of||||1||u2~ip~o7*10,of~5;u3~ip~o7*20,of*2~6;u4~ip~o7*40,of*4~7;p4~~o8
Frostfire Bow|7|w|b|ip|4||r3,o7*20,of||||1||u2~ip~o7*10,of~5;u3~ip~o7*20,of*2~6;u4~ip~o7*40,of*4~7;p4~~o8
Frostfire Crossbow|7|w|b|ip|4||r4,o7*20,of||||1||u2~ip~o7*10,of~5;u3~ip~o7*20,of*2~6;u4~ip~o7*40,of*4~7;p4~~o8
Frostfire Dagger|7|w|1|ip|4||r5,o7*20,of||||1||u2~ip~o7*10,of~5;u3~ip~o7*20,of*2~6;u4~ip~o7*40,of*4~7;p4~~o8
Frostfire Greataxe|7|w|2|ip|4||r6,o7*20,of||||1||u2~ip~o7*10,of~5;u3~ip~o7*20,of*2~6;u4~ip~o7*40,of*4~7;p4~~o8
Frostfire Greatsword|7|w|2|ip|4||r7,o7*20,of||||1||u2~ip~o7*10,of~5;u3~ip~o7*20,of*2~6;u4~ip~o7*40,of*4~7;p4~~o8
Frostfire Knucklechains|7|w|2|ip|4||r8,o7*20,of||||1||u2~ip~o7*10,of~5;u3~ip~o7*20,of*2~6;u4~ip~o7*40,of*4~7;p4~~o8
Frostfire Mace|7|w|1|ip|4||r9,o7*20,of||||1||u2~ip~o7*10,of~5;u3~ip~o7*20,of*2~6;u4~ip~o7*40,of*4~7;p4~~o8
Frostfire Sledge|7|w|2|ip|4||ra,o7*20,of||||1||u2~ip~o7*10,of~5;u3~ip~o7*20,of*2~6;u4~ip~o7*40,of*4~7;p4~~o8
Frostfire Spear|7|w|1|ip|4||rb,o7*20,of||||1||u2~ip~o7*10,of~5;u3~ip~o7*20,of*2~6;u4~ip~o7*40,of*4~7;p4~~o8
Frostfire Sword|7|w|1|ip|4||rc,o7*20,of||||2||u2~ip~o7*10,of~5;u3~ip~o7*20,of*2~6;u4~ip~o7*40,of*4~7;p4~~o8
Lightning Strike|7|w|2|cn|||tv||||1|Two steps: Galdr Table L3 → Cast: Lightning Strike, then Frost Foundry.|p4~~o8
Nord Atgeir|7|w|2|cn|||tw||||1|Two steps: Black Forge L4 → Cast: Nord Atgeir, then Frost Foundry.|p4~~o8
Nord Axe|7|w|1|cn|||tx||||1|Two steps: Black Forge L4 → Cast: Nord Axe, then Frost Foundry.|p4~~o8
Nord Bow|7|w|b|cn|||ty||||1|Two steps: Black Forge L4 → Cast: Nord Bow, then Frost Foundry.|p4~~o8
Nord Crossbow|7|w|b|cn|||u0||||1|Two steps: Black Forge L4 → Cast: Nord Crossbow, then Frost Foundry.|p4~~o8
Nord Dagger|7|w|1|cn|||u1||||1|Two steps: Black Forge L4 → Cast: Nord Dagger, then Frost Foundry.|p4~~o8
Nord Greataxe|7|w|2|cn|||u2||||1|Two steps: Black Forge L4 → Cast: Nord Greataxe, then Frost Foundry.|p4~~o8
Nord Greatsword|7|w|2|cn|||u4||||1|Two steps: Black Forge L4 → Cast: Nord Greatsword, then Frost Foundry.|p4~~o8
Nord Knucklechains|7|w|2|cn|||u5||||1|Two steps: Black Forge L4 → Cast: Nord Knucklechains, then Frost Foundry.|p4~~o8
Nord Mace|7|w|1|cn|||u6||||1|Two steps: Black Forge L4 → Cast: Nord Mace, then Frost Foundry.|p4~~o8
Nord Sledge|7|w|2|cn|||u8||||1|Two steps: Black Forge L4 → Cast: Nord Sledge, then Frost Foundry.|p4~~o8
Nord Spear|7|w|1|cn|||u9||||1|Two steps: Black Forge L4 → Cast: Nord Spear, then Frost Foundry.|p4~~o8
Nord Sword|7|w|1|cn|||ua||||2|Cast at the Black Forge (level 4) from 20 Bloodgold, 10 Timberwood and Mould: Nord Sword → Cast: Nord Sword, then tempered at the Frost Foundry. Upgrades at Black Forge level 5/6/7 (costs not recorded).|u2~ip~~5;u3~ip~~6;u4~ip~~7;p4~~o8,o7*45,px*22
Northern Vengeance|7|w|2|cn|||ub||||1|Two steps: Galdr Table L3 → Cast: Northern Vengeance, then Frost Foundry.|p4~~o8
Salvaged Lantern|7|w|t||||||xBreak a standing lantern in the Deep North||2|Not on valheim.source.gs; data from valheim.tools
Snowball|7|w|1|H||10|oi*5||gSnowball||1|
Spirit Caller|7|w|2|cn|||ud||||1|Two steps: Galdr Table L3 → Cast: Spirit Caller, then Frost Foundry.|p4~~o8
Thunderblood Atgeir|7|w|2|ip|4||r1,o7*20,pw||||1||u2~ip~o7*10,pw~5;u3~ip~o7*20,pw*2~6;u4~ip~o7*40,pw*4~7;p4~~o8
Thunderblood Axe|7|w|1|ip|4||r2,o7*20,pw||||1||u2~ip~o7*10,pw~5;u3~ip~o7*20,pw*2~6;u4~ip~o7*40,pw*4~7;p4~~o8
Thunderblood Bow|7|w|b|ip|4||r3,o7*20,pw||||1||u2~ip~o7*10,pw~5;u3~ip~o7*20,pw*2~6;u4~ip~o7*40,pw*4~7;p4~~o8
Thunderblood Crossbow|7|w|b|ip|4||r4,o7*20,pw||||1||u2~ip~o7*10,pw~5;u3~ip~o7*20,pw*2~6;u4~ip~o7*40,pw*4~7;p4~~o8
Thunderblood Dagger|7|w|1|ip|4||r5,o7*20,pw||||1||u2~ip~o7*10,pw~5;u3~ip~o7*20,pw*2~6;u4~ip~o7*40,pw*4~7;p4~~o8
Thunderblood Greataxe|7|w|2|ip|4||r6,o7*20,pw||||1||u2~ip~o7*10,pw~5;u3~ip~o7*20,pw*2~6;u4~ip~o7*40,pw*4~7;p4~~o8
Thunderblood Greatsword|7|w|2|ip|4||r7,o7*20,pw||||1||u2~ip~o7*10,pw~5;u3~ip~o7*20,pw*2~6;u4~ip~o7*40,pw*4~7;p4~~o8
Thunderblood Knucklechains|7|w|2|ip|4||r8,o7*20,pw||||1||u2~ip~o7*10,pw~5;u3~ip~o7*20,pw*2~6;u4~ip~o7*40,pw*4~7;p4~~o8
Thunderblood Mace|7|w|1|ip|4||r9,o7*20,pw||||1||u2~ip~o7*10,pw~5;u3~ip~o7*20,pw*2~6;u4~ip~o7*40,pw*4~7;p4~~o8
Thunderblood Sledge|7|w|2|ip|4||ra,o7*20,pw||||1||u2~ip~o7*10,pw~5;u3~ip~o7*20,pw*2~6;u4~ip~o7*40,pw*4~7;p4~~o8
Thunderblood Spear|7|w|1|ip|4||rb,o7*20,pw||||1||u2~ip~o7*10,pw~5;u3~ip~o7*20,pw*2~6;u4~ip~o7*40,pw*4~7;p4~~o8
Thunderblood Sword|7|w|1|ip|4||rc,o7*20,pw||||2||u2~ip~o7*10,pw~5;u3~ip~o7*20,pw*2~6;u4~ip~o7*40,pw*4~7;p4~~o8
Voidcaller|7|w|1||||||xDropped by The Void (100%)||1|Not dropped by The Void (valheim.tools); source not modelled
Nord Buckler|7|s||cn|||tz||||1|Two steps: Black Forge L4 → Cast: Nord Buckler, then Frost Foundry.|p3~~oa
Nord Greatshield|7|s||cn|||u3||||1|Two steps: Black Forge L4 → Cast: Nord Greatshield, then Frost Foundry.|p3~~oa
Nord Shield|7|s||cn|||u7||||1|Two steps: Black Forge L4 → Cast: Nord Shield, then Frost Foundry.|p3~~oa
Bloodgold Arrow|7|o||ip||20|o7,l*2,px*8||||1|
Bloodgold Bolt|7|o||ip||20|o7,px*8,l*2||||1|
Bloodgold Missile|7|o||ck||20|px*10,o7||||1||xammo~io
Breastplate of the Protector|7|a|C|cn|||to||||2|Two steps: Black Forge L4 → Cast: Breastplate of the Protector, then Frost Foundry.|p4~~oa
Cape of the Caller|7|a|K|is|4||ps*6,pk*2,o7*5,gg*15||||1||u2~is~ps*3,pk,o7*2,gg*5~5;u3~is~ps*6,pk*2,o7*4,gg*10~6;u4~is~ps*12,pk*4,o7*8,gg*20~7;p4~~oa
Chestpiece of the Vanguard|7|a|C|cn|||tp||||2|Two steps: Black Forge L4 → Cast: Chestpiece of the Vanguard, then Frost Foundry.|p4~~oa
Crown of Valheim|7|a|H|ip|4||o7*5,ob||||2|
Fishing Hat|7|a|H|3b|||13,4p,t8,b7,4q,8f,dt,t7,gu,q1,kn,gv||||1||u2~3b~13,4p,t8,b7,4q,8f,dt,t7,gu,q1,kn,gv~2;u3~3b~13*2,4p*2,t8*2,b7*2,4q*2,8f*2,dt*2,t7*2,gu*2,q1*2,kn*2,gv*2~3;u4~3b~13*4,4p*4,t8*4,b7*4,4q*4,8f*4,dt*4,t7*4,gu*4,q1*4,kn*4,gv*4~4;p4~~f
Headdress of the Caller|7|a|H|cn|||tr||||1|Two steps: Galdr Table L3 → Cast: Headdress of the Caller, then Frost Foundry.|p4~~oa
Helmet of the Protector|7|a|H|cn|||ts||||1|Two steps: Black Forge L4 → Cast: Helmet of the Protector, then Frost Foundry.
Hood of the Vanguard|7|a|H|cn|||tt||||1|Two steps: Black Forge L4 → Cast: Hood of the Vanguard, then Frost Foundry.|p4~~oa
Ice Shoes|7|a|U||||||xFound in the world (Deep North); exact source unknown||2|Deep North utility item. Found in world, exact source unknown (not crafted).
Ice Skates|7|a|U||||||xFound in the world (Deep North); exact source unknown||2|Deep North utility item. Found in world, exact source unknown (not crafted).
Moose Hide Cape|7|a|K|ip|4||oo*6,oq*2,o7*5||||2||u2~ip~oo*3,oq,o7*2~5;u3~ip~oo*6,oq*2,o7*4~6;u4~ip~oo*12,oq*4,o7*8~7;p4~~oa
Neckstabber|7|a|T|ip|||o7*5,om*5,sn||||2|
Robes of the Caller|7|a|C|cn|||uc||||2|Two steps: Galdr Table L3 → Cast: Robes of the Caller, then Frost Foundry.|p4~~oa
Trousers of the Caller|7|a|L|cn|||ue||||1|Two steps: Galdr Table L3 → Cast: Trousers of the Caller, then Frost Foundry.|p4~~oa
Trousers of the Protector|7|a|L|cn|||uf||||1|Two steps: Black Forge L4 → Cast: Trousers of the Protector, then Frost Foundry.|p4~~oa
Trousers of the Vanguard|7|a|L|cn|||ug||||1|Two steps: Black Forge L4 → Cast: Trousers of the Vanguard, then Frost Foundry.|p4~~oa
Witch Crown|7|a|T|ip|||o7*5,pk*5,sl||||1|
Barka Trophy|7|r|||||||||1|
Elaking Trophy|7|r|||||||||1|
Eyeless One Trophy|7|r|||||||||1|
Frost Blob Trophy|7|r|||||||||1|
Hexen Trophy|7|r|||||||||1|
Krigen Trophy|7|r|||||||||1|
Moose Trophy|7|r|||||||||1|
Pulp Trophy|7|r|||||||||1|
Seal Trophy|7|r|||||||||1|
Intricate Key|7|x||cn|||tu||||2|Two steps: Black Forge L4 → Cast: Intricate Key, then Frost Foundry.
Malicious Blood|7|x|||||||gBlack Ice Core||2|Broken out of Black Ice Cores (Deep North)
Moose Saddle|7|x||ip|2||o7*4,ps*5,px*5,di*15||||2|
Oat Flour|7|x||cr|||qe||||2|
Frigid Kiln|7|S||3b|||y*20,au*10,oi*5||||2||Foi
Timberwood Drawbridge|7|S||3b|||k4*2,o7*2,px*24||||1|
Wardrobe|7|S||3b|||px*10,dp*2,dc*6||||1|
Smith's Aprons|7|E||ip|||o7*5,px*8,oo*2||eip||1|
Smoker|7|E||3b|||o7*5,px*6||e6s||1|
Standing Loom|7|E||is|||px*5,pk*10||eis||1|
Leviathan|8|C||||||t2::3–4|xOcean: mine the Abyssal Barnacles on its back – 3–4 Chitin per barnacle (it may dive)||2|Not on valheim.source.gs; data from valheim.tools
Serpent|8|C||||||tg:33,t5::6–7,t6::8–9|||1|
Chitin|8|m|||||||gAbyssal Barnacle;xFishing bonus from Coral Cod||1|
Sailor's Bounty|8|m||a0|||8h*5,4i*4,t9*2,t4||||1|
Seafarer's Herbs|8|m|||||||tW130@t1||2|
Serpent Meat|8|m|||||||||1|
Serpent Scale|8|m|||||||||1|
Coral Cod|8|h|||||||bte;xOcean||2|A catch can also bring Chitin or Onion Seeds.
Tuna|8|h|||||||bte;xOcean||2|
Cooked Serpent Meat|8|f||a2|||t5||||1||aAlternative recipe~a2~t5
Serpent Stew|8|f||6s|2||18,t9,17*2||||1|
Abyssal Harpoon|8|w|1|3b|2||46*8,t2*30,p*3||||1|
Abyssal Razor|8|w|1|3b|2||46*4,t2*20,p*2||||1||u2~3b~t2*10~3;u3~3b~t2*20~4;u4~3b~t2*40~5;p4~~87
Serpent Scale Shield|8|s||6v|3||46*10,7q*4,t6*8||||1||u2~6v~46*10,7q*2,t6*4~4;u3~6v~46*20,7q*4,t6*8~5;p3~~88
Heavy Fishing Bait|8|o||a0||20|5q*20,tg||||1|
Fins of Destiny|8|a|T|6v|||t2*5,t6*5,tg||||1|
Serpent Trophy|8|r|||||||||1||xobliterator~a4
Hildir|1|T|||||||xCamp in the Meadows, but not on the starting island – requires a boat (realistically the Karve, Black Forest stage)||2|Haldor's sister; her camp is in the Meadows on another island, so reaching her needs a boat (Karve → Black Forest stage). Sells cosmetics; most stock unlocks when you return her three stolen chests.
Haldor|1|T|||||||xCamp in the Black Forest||2|Dvergr merchant in the Black Forest (~1.9 km from spawn typical).
Bog Witch|2|T|||||||xCamp in the Swamp||2|Deep in a Swamp, usually 3 km+ from the world centre. Sells feast ingredients and spices; one spice unlocks per boss.
Wider Pockets|4|x|||||||tH1000@ad||2|+1 inventory row, kept on the character; once per character.
Deeper Pockets|6|x|||||||tH2000@fj||2|+1 inventory row, kept on the character; once per character.
Deer White Trophy|1|r|||||||||2|Dropped by Deer White (100%). Rare variant, spawn unconfirmed.
Asksvin Skeleton|6|S||3b|||3v*50,jk,jl,jm,jn||||2|Build piece made from one of each asksvin bone (valheim.tools)
Cast: Breastplate of the Protector|7|m|cast|ip|4||o7*20,or,oo*8,ok*4||||1|Intermediate: temper in the Frost Foundry (fuel Liquid Frost) to get Breastplate of the Protector.
Cast: Chestpiece of the Vanguard|7|m|cast|ip|4||o7*12,os,oe*8,ok*4||||1|Intermediate: temper in the Frost Foundry (fuel Liquid Frost) to get Chestpiece of the Vanguard.
Cast: Echo Spike|7|m|cast|is|3||o7*10,pk*4,of,ot||||1|Intermediate: temper in the Frost Foundry (fuel Liquid Frost) to get Echo Spike.
Cast: Headdress of the Caller|7|m|cast|is|3||oq*2,ou,sn,pk*3||||1|Intermediate: temper in the Frost Foundry (fuel Liquid Frost) to get Headdress of the Caller.
Cast: Helmet of the Protector|7|m|cast|ip|4||o7*20,ov,oo*4||||1|Intermediate: temper in the Frost Foundry (fuel Liquid Frost) to get Helmet of the Protector.
Cast: Hood of the Vanguard|7|m|cast|ip|4||ps*5,ow,oo*5,oq||||1|Intermediate: temper in the Frost Foundry (fuel Liquid Frost) to get Hood of the Vanguard.
Cast: Intricate Key|7|m|cast|ip|4||o7*5,ox||||1|Intermediate: temper in the Frost Foundry (fuel Liquid Frost) to get Intricate Key.
Cast: Lightning Strike|7|m|cast|is|3||o7*10,pk*5,pw,oy||||1|Intermediate: temper in the Frost Foundry (fuel Liquid Frost) to get Lightning Strike.
Cast: Nord Atgeir|7|m|cast|ip|4||o7*20,oz,px*10||||1|Intermediate: temper in the Frost Foundry (fuel Liquid Frost) to get Nord Atgeir.
Cast: Nord Axe|7|m|cast|ip|4||o7*20,p0,px*10||||1|Intermediate: temper in the Frost Foundry (fuel Liquid Frost) to get Nord Axe.
Cast: Nord Bow|7|m|cast|ip|4||o7*20,p1,px*10||||1|Intermediate: temper in the Frost Foundry (fuel Liquid Frost) to get Nord Bow.
Cast: Nord Buckler|7|m|cast|ip|4||o7*10,p2,px*10||||1|Intermediate: temper in the Frost Foundry (fuel Liquid Frost) to get Nord Buckler.
Cast: Nord Crossbow|7|m|cast|ip|4||o7*20,p3,px*10||||1|Intermediate: temper in the Frost Foundry (fuel Liquid Frost) to get Nord Crossbow.
Cast: Nord Dagger|7|m|cast|ip|4||o7*20,p4,px*10||||1|Intermediate: temper in the Frost Foundry (fuel Liquid Frost) to get Nord Dagger.
Cast: Nord Greataxe|7|m|cast|ip|4||o7*20,p5,px*10||||1|Intermediate: temper in the Frost Foundry (fuel Liquid Frost) to get Nord Greataxe.
Cast: Nord Greatshield|7|m|cast|ip|4||o7*20,p6,px*20||||1|Intermediate: temper in the Frost Foundry (fuel Liquid Frost) to get Nord Greatshield.
Cast: Nord Greatsword|7|m|cast|ip|4||o7*20,p7,og*2||||1|Intermediate: temper in the Frost Foundry (fuel Liquid Frost) to get Nord Greatsword.
Cast: Nord Knucklechains|7|m|cast|ip|4||o7*20,p8,om*2||||1|Intermediate: temper in the Frost Foundry (fuel Liquid Frost) to get Nord Knucklechains.
Cast: Nord Mace|7|m|cast|ip|4||o7*20,p9,px*10||||1|Intermediate: temper in the Frost Foundry (fuel Liquid Frost) to get Nord Mace.
Cast: Nord Shield|7|m|cast|ip|4||o7*15,pa,px*10||||1|Intermediate: temper in the Frost Foundry (fuel Liquid Frost) to get Nord Shield.
Cast: Nord Sledge|7|m|cast|ip|4||o7*20,pb,px*10||||1|Intermediate: temper in the Frost Foundry (fuel Liquid Frost) to get Nord Sledge.
Cast: Nord Spear|7|m|cast|ip|4||o7*20,pc,px*10||||1|Intermediate: temper in the Frost Foundry (fuel Liquid Frost) to get Nord Spear.
Cast: Nord Sword|7|m|cast|ip|4||o7*20,pd,px*10||||1|Intermediate: temper in the Frost Foundry (fuel Liquid Frost) to get Nord Sword.
Cast: Northern Vengeance|7|m|cast|is|3||oi*10,pk*5,sl,pe||||1|Intermediate: temper in the Frost Foundry (fuel Liquid Frost) to get Northern Vengeance.
Cast: Robes of the Caller|7|m|cast|is|3||o7*6,pf,oo*6,pk*5||||1|Intermediate: temper in the Frost Foundry (fuel Liquid Frost) to get Robes of the Caller.
Cast: Spirit Caller|7|m|cast|is|3||og*8,pk*5,sn,pg||||1|Intermediate: temper in the Frost Foundry (fuel Liquid Frost) to get Spirit Caller.
Cast: Trousers of the Caller|7|m|cast|is|3||o7*6,ph,oo*6,pk*5||||1|Intermediate: temper in the Frost Foundry (fuel Liquid Frost) to get Trousers of the Caller.
Cast: Trousers of the Protector|7|m|cast|ip|4||o7*20,pi,oo*8,ok*4||||1|Intermediate: temper in the Frost Foundry (fuel Liquid Frost) to get Trousers of the Protector.
Cast: Trousers of the Vanguard|7|m|cast|ip|4||o7*12,pj,oe*8,ps*4||||1|Intermediate: temper in the Frost Foundry (fuel Liquid Frost) to get Trousers of the Vanguard.
Birds' Nest|2|S|producer|3b|||8e*2,3p*3,4i*5||||1|Producer piece: generates Feathers (source.gs processing).`;

type N = { n: string; l: number; t: string; sub: string; st: number[]; lvl: number; y: number; rec: number[][]; dr: string[][]; src: string[]; eats: number[]; v: number; note: string; ex: string[] };
const b = (x: string): number => parseInt(x, 36);
const D: N[] = RAW.split("\n").map((line: string) => {
  const f = line.split("|");
  return {
    n: f[0], l: +f[1], t: f[2], sub: f[3],
    st: f[4] === "" ? [] : f[4] === "H" ? [-1] : f[4].split(">").map(b),
    lvl: f[5] ? +f[5] : 1, y: f[6] ? +f[6] : 1,
    rec: f[7] ? f[7].split(",").map((x: string) => { const p = x.split("*"); return [b(p[0]), p.length > 1 ? +p[1] : 1]; }) : [],
    dr: f[8] ? f[8].split(",").map((x: string) => x.split(":")) : [],
    src: f[9] ? f[9].split(";") : [],
    eats: f[10] ? f[10].split(",").map(b) : [],
    v: +f[11], note: f[12] || "",
    ex: f[13] ? f[13].split(";") : [],
  };
}).filter((r: N) => r.n && !isNaN(r.l));
const ok = (i: number): boolean => i >= 0 && i < D.length && !isNaN(i);

const LANES = ["Meadows", "Black Forest", "Swamp", "Mountain", "Plains", "Mistlands", "Ashlands", "Deep North", "Ocean"];
const LANE_SUB = ["Boss: Eikthyr", "Boss: The Elder", "Boss: Bonemass", "Boss: Moder", "Boss: Yagluth", "Boss: The Queen", "Boss: Fader", "Boss: Kall Fimbulbringer", "Side lane"];
const GROUPS: [string, string][] = [["B", "Bosses"], ["M", "Minibosses"], ["C", "Creatures"], ["T", "Traders"], ["m", "Materials"], ["S", "Stations & buildings"], ["E", "Station upgrades"], ["t", "Tools"], ["w", "Weapons"], ["s", "Shields"], ["o", "Ammo & bait"], ["a", "Armor & accessories"], ["f", "Food"], ["d", "Meads"], ["h", "Fish"], ["r", "Trophies"], ["x", "Other (valuables, keys, misc)"]];
const GL: Record<string, string> = {};
GROUPS.forEach((g: [string, string]) => { GL[g[0]] = g[1]; });
const SUB_EN: Record<string, string> = { "1": "one-handed", "2": "two-handed", b: "bow", t: "torch", H: "head", C: "chest", L: "legs", K: "cape", T: "trinket", U: "utility" };
const DEF_CLOSED = ["w", "s", "o", "a", "f", "d", "h", "r", "x", "E"];
const isCre = (i: number): boolean => "BMC".indexOf(D[i].t) >= 0;
const isBuilt = (i: number): boolean => D[i].t === "S" || D[i].t === "E";
const find = (n: string): number => D.findIndex((r: N) => r.n === n);
const HAMMER = find("Hammer");
const COINS = find("Coins");
const TRIDX: Record<string, number> = { H: find("Haldor"), h: find("Hildir"), W: find("Bog Witch") };

// Edge kinds: c = crafted (recipe / crafting station), b = built (Hammer, materials, station nearby),
// t = trade (coins, traders, selling valuables), g = unlock (boss / returned chest), d = drop, o = other (tool, bait, key, laid by, offering)
const KINDS: [string, string][] = [["c", "Crafted at a station"], ["b", "Built with the Hammer"], ["t", "Trade (coins)"], ["g", "Unlocks (boss / chest)"], ["d", "Creature drop"], ["o", "Gather tool, bait, key, offering, fuel, ammo"]];
const UPS: number[][] = D.map(() => [] as number[]);
const EK = new Map<string, string>();
// EXV: label for extra relations (upgrade, alternative recipe, Forge of Potential, fuel, ammo, plant, obliterator)
const EXV = new Map<string, string>();
const xl = (t: string): string => {
  const c = t[0], p = t.slice(1).split("~");
  if (c === "u") return `Quality ${p[0]} · ${p[1] && ok(b(p[1])) ? D[b(p[1])].n + (p[3] ? ` lvl ${p[3]}` : "") : "by hand"}${p[2] ? "" : " · cost not recorded"}`;
  if (c === "p") return `Forge of Potential · past quality ${p[0]}`;
  return p[0];
};
const add = (to: number, from: number, k: string) => {
  if (!ok(to) || !ok(from) || to === from) return;
  if (UPS[to].indexOf(from) < 0) UPS[to].push(from);
  if (!EK.has(from + ">" + to)) EK.set(from + ">" + to, k);
};
const DROPPERS: [number, string, string][][] = D.map(() => [] as [number, string, string][]);
const SELLS: [number, string, number][][] = D.map(() => [] as [number, string, number][]);
const GATES: number[][] = D.map(() => [] as number[]);
const UPGR: number[][] = D.map(() => [] as number[]);
const VALS: [number, string][] = [];
D.forEach((r: N, i: number) => {
  const k = isCre(i) ? "o" : isBuilt(i) ? "b" : "c";
  r.rec.forEach((x: number[]) => add(i, x[0], k));
  r.st.forEach((x: number) => { if (x >= 0) add(i, x, k); });
  if (isBuilt(i) && HAMMER >= 0) add(i, HAMMER, "b");
  r.src.forEach((t: string) => {
    const c = t[0], body = t.slice(1), at = t.indexOf("@");
    const gate = at >= 0 ? b(t.slice(at + 1)) : -1;
    if (c === "g" && at >= 0) add(i, gate, "o");
    if (c === "t") {
      const tr = TRIDX[body[0]];
      const price = at >= 0 ? body.slice(1, at - 1) : body.slice(1);
      add(i, tr, "t");
      if (ok(tr)) SELLS[tr].push([i, price, gate]);
      if (ok(gate)) { add(i, gate, "g"); GATES[gate].push(i); }
    }
    if (c === "l" || c === "k" || c === "b") add(i, b(body), "o");
    if (c === "e") { const s = b(body); add(i, s, "b"); if (ok(s)) UPGR[s].push(i); }
    if (c === "v") { add(COINS, i, "t"); VALS.push([i, body]); }
  });
  r.dr.forEach((d: string[]) => { const j = b(d[0]); if (!ok(j)) return; add(j, i, "d"); DROPPERS[j].push([i, d[1] || "100", d[2] || "1"]); });
  r.ex.forEach((t: string) => {
    const c = t[0], p = t.slice(1).split("~");
    if (c === "u" || c === "a" || c === "p") {
      const v = c === "u" ? "upgrade" : c === "a" ? "alt. recipe" : "Forge of Potential";
      (p[1] ? p[1].split(">") : []).forEach((s: string) => { const j = b(s); add(i, j, "c"); if (r.st.indexOf(j) < 0 && !EXV.has(j + ">" + i)) EXV.set(j + ">" + i, v); });
      (p[2] ? p[2].split(",") : []).forEach((x: string) => { const j = b(x.split("*")[0]); add(i, j, "c"); if (!EXV.has(j + ">" + i)) EXV.set(j + ">" + i, v); });
    }
    if (c === "F") { const j = b(t.slice(1)); add(i, j, "o"); EXV.set(j + ">" + i, "fuel"); }
    if (c === "x" && p.length > 1) { const j = b(p[1]); add(j, i, "o"); EXV.set(i + ">" + j, p[0]); }
  });
});
Object.keys(TRIDX).forEach((k: string) => add(TRIDX[k], COINS, "t"));
const DOWNS: number[][] = D.map(() => [] as number[]);
UPS.forEach((u: number[], i: number) => u.forEach((j: number) => { if (DOWNS[j].indexOf(i) < 0) DOWNS[j].push(i); }));

function closure(start: number, g: number[][]): Set<number> {
  const seen = new Set<number>();
  const st = [...g[start]];
  while (st.length) { const n = st.pop() as number; if (!seen.has(n) && n !== start) { seen.add(n); g[n].forEach((x: number) => st.push(x)); } }
  return seen;
}
const COUNTS = LANES.map((_x: string, li: number) => D.filter((r: N) => r.l === li).length);

type Seg = { d: string; c: string; dash: boolean };

// Same hall skin as the compact view: wood, iron, runes, ember selection, parchment notes.
const RUNE = "'Cinzel', 'Norse', 'Trajan Pro', 'Palatino Linotype', 'Book Antiqua', Georgia, serif";
const BODY = "'Alegreya', 'IM Fell English', 'Palatino Linotype', 'Book Antiqua', Georgia, serif";
const RUNIC = "'Noto Sans Runic', 'Segoe UI Historic', 'Segoe UI Symbol', serif";
const INK = { hi: "#f3e6c8", mid: "#d8c49c", lo: "#b3a084", dark: "#2a1b0e", amber: "#e8b04f" };
const SKIN_CSS = "@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Alegreya:wght@400;700&family=Noto+Sans+Runic&display=swap');"
  + ".vh-in::placeholder{color:#a8957a;opacity:1}.vh-scroll::-webkit-scrollbar{width:8px;height:6px}.vh-scroll::-webkit-scrollbar-thumb{background:#6e5232;border-radius:4px}.vh-scroll::-webkit-scrollbar-track{background:transparent}";
const NOISE = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.20 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";
const GRAIN = "repeating-linear-gradient(91deg, rgba(0,0,0,0.10) 0px, rgba(0,0,0,0.10) 2px, rgba(255,230,190,0.018) 2px, rgba(255,230,190,0.018) 6px, rgba(0,0,0,0.05) 6px, rgba(0,0,0,0.05) 11px)";
const BIOME: [string, string, string][] = [
  ["#46542a", "#1b220f", "#d8cf78"],
  ["#1f3a28", "#0a140e", "#7fb48a"],
  ["#33402a", "#0e1c1b", "#8fb59a"],
  ["#3e5064", "#141c26", "#d6e8f6"],
  ["#5c4b20", "#21180a", "#f0cc6c"],
  ["#3d2f50", "#140e1c", "#c4a6e4"],
  ["#521a12", "#100505", "#ff7a45"],
  ["#4f5e6c", "#1a2129", "#eaf4fb"],
  ["#16385a", "#06111d", "#7cc0e2"],
];
const BRUNE = ["ᚠ", "ᚢ", "ᚦ", "ᚺ", "ᛃ", "ᛈ", "ᚲ", "ᛁ", "ᛚ"];
const KINDC: Record<string, string> = { c: "#f0a640", b: "#7fb2d9", t: "#9fcf6e", g: "#c79bf0", d: "#e8685a", o: "#cdbf9f" };

export default function App() {
  const theme = useGrokTheme();
  const [q, setQ] = useState("");
  const [hidden, setHidden] = useState<string[]>([]);
  const [closed, setClosed] = useState<string[]>(DEF_CLOSED);
  const [depth, setDepth] = useState("1");
  const [sel, setSel] = useState<number | null>(null);
  const [width, setWidth] = useState(1000);
  const [tick, setTick] = useState(0);
  const [paths, setPaths] = useState<Seg[]>([]);
  const [box, setBox] = useState<[number, number]>([0, 0]);
  const wrapRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const chips = useRef<Map<number, HTMLElement>>(new Map());
  const wide = width >= 760;
  const KC: Record<string, string> = KINDC;
  const upC = theme.text.primary;
  const downC = theme.text.secondary;

  const upSet = useMemo(() => (sel === null ? new Set<number>() : depth === "all" ? closure(sel, UPS) : new Set<number>(UPS[sel])), [sel, depth]);
  const downSet = useMemo(() => (sel === null ? new Set<number>() : depth === "all" ? closure(sel, DOWNS) : new Set<number>(DOWNS[sel])), [sel, depth]);
  const ql = q.trim().toLowerCase();

  const visible = useMemo(() => D.map((r: N, i: number) => {
    if (i === sel || upSet.has(i) || downSet.has(i)) return true;
    if (hidden.indexOf(r.t) >= 0) return false;
    if (ql && r.n.toLowerCase().indexOf(ql) < 0) return false;
    return true;
  }), [ql, hidden, sel, upSet, downSet]);
  const visCount = visible.filter((v: boolean) => v).length;

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => { setWidth(el.clientWidth); setTick((t: number) => t + 1); });
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const c = contentRef.current;
    if (!c) return;
    const cr = c.getBoundingClientRect();
    setBox([c.scrollWidth, c.scrollHeight]);
    if (sel === null) { setPaths([]); return; }
    const edges: [number, number, boolean][] = [];
    if (depth === "all") {
      [sel, ...Array.from(upSet)].forEach((n: number) => UPS[n].forEach((u: number) => { if (upSet.has(u)) edges.push([u, n, false]); }));
      [sel, ...Array.from(downSet)].forEach((n: number) => DOWNS[n].forEach((d: number) => { if (downSet.has(d)) edges.push([n, d, true]); }));
    } else {
      UPS[sel].forEach((u: number) => edges.push([u, sel, false]));
      DOWNS[sel].forEach((d: number) => edges.push([sel, d, true]));
    }
    const out: Seg[] = [];
    edges.slice(0, 400).forEach(([a, bb, dn]: [number, number, boolean]) => {
      const ea = chips.current.get(a); const eb = chips.current.get(bb);
      if (!ea || !eb) return;
      const ra = ea.getBoundingClientRect(); const rb = eb.getBoundingClientRect();
      const ax = ra.left - cr.left + ra.width / 2, ay = ra.top - cr.top + ra.height / 2;
      const bx = rb.left - cr.left + rb.width / 2, by = rb.top - cr.top + rb.height / 2;
      const dx = bx - ax, dy = by - ay;
      let d = "";
      if (Math.abs(dx) >= Math.abs(dy)) {
        const sx = dx >= 0 ? ax + ra.width / 2 : ax - ra.width / 2;
        const ex = dx >= 0 ? bx - rb.width / 2 : bx + rb.width / 2;
        const o = Math.max(30, Math.abs(ex - sx) / 2) * (dx >= 0 ? 1 : -1);
        d = `M${sx},${ay} C${sx + o},${ay} ${ex - o},${by} ${ex},${by}`;
      } else {
        const sy = dy >= 0 ? ay + ra.height / 2 : ay - ra.height / 2;
        const ey = dy >= 0 ? by - rb.height / 2 : by + rb.height / 2;
        const o = Math.max(20, Math.abs(ey - sy) / 2) * (dy >= 0 ? 1 : -1);
        d = `M${ax},${sy} C${ax},${sy + o} ${bx},${ey - o} ${bx},${ey}`;
      }
      out.push({ d, c: KC[EK.get(a + ">" + bb) || "o"], dash: dn });
    });
    setPaths(out);
  }, [sel, depth, upSet, downSet, visible, closed, tick, wide]);

  useEffect(() => {
    if (sel !== null && panelRef.current) panelRef.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [sel]);

  const pick = (i: number) => setSel((s: number | null) => (s === i ? null : i));
  const toggle = (arr: string[], k: string): string[] => (arr.indexOf(k) >= 0 ? arr.filter((x: string) => x !== k) : [...arr, k]);

  const muted = { ...theme.font.label, fontFamily: BODY, color: INK.mid };
  const parchMeta = { ...theme.font.label, fontFamily: BODY, color: "#5a4128" };
  const h3 = { fontFamily: RUNE, fontSize: "15px", lineHeight: "20px", fontWeight: 700, letterSpacing: "0.04em", color: "#6a3211", marginTop: 10, marginBottom: 4 };
  const pill = (on: boolean) => ({ ...theme.font.label, fontFamily: BODY, fontSize: "13px", cursor: "pointer", padding: "4px 10px", borderRadius: 4, whiteSpace: "nowrap" as const, border: `1px solid ${on ? "#ffb25e" : "#7a5a36"}`, background: on ? "linear-gradient(180deg, #b45c1f 0%, #6e3110 100%)" : "linear-gradient(180deg, #3d2e20 0%, #22180f 100%)", color: on ? "#fff3dc" : INK.mid, boxShadow: on ? "0 0 10px rgba(255,140,50,0.45), inset 0 1px 0 rgba(255,220,170,0.35)" : "inset 0 1px 0 rgba(255,225,170,0.10), 0 1px 2px rgba(0,0,0,0.6)", textShadow: "0 1px 1px rgba(0,0,0,0.7)", userSelect: "none" as const });
  const rivet = (pos: { top?: number; left?: number; right?: number; bottom?: number }) => <span style={{ position: "absolute", width: 8, height: 8, borderRadius: "50%", background: "radial-gradient(circle at 35% 30%, #e0d3b8 0%, #857259 35%, #2b2219 80%)", boxShadow: "0 1px 1px rgba(0,0,0,0.8)", pointerEvents: "none", ...pos }} />;
  const ek = (a: number, z: number): string => KC[EK.get(a + ">" + z) || "o"];

  const chip = (i: number) => {
    const r = D[i];
    const isSel = sel === i, isUp = upSet.has(i), isDown = downSet.has(i);
    const dim = sel !== null && !isSel && !isUp && !isDown;
    const color = isSel ? "#ffb25e" : sel !== null && depth === "1" && isUp ? ek(i, sel) : sel !== null && depth === "1" && isDown ? ek(sel, i) : isUp || isDown ? "#d9a44e" : "#6e5232";
    return (
      <div
        key={"c" + i}
        ref={(el: HTMLDivElement | null) => { if (el) chips.current.set(i, el); else chips.current.delete(i); }}
        onClick={() => pick(i)}
        style={{
          ...theme.font.label, fontFamily: BODY, fontSize: "13px", display: "inline-flex", alignItems: "center", padding: "4px 9px", borderRadius: 4, cursor: "pointer",
          border: `${isSel || isUp || isDown ? 2 : 1}px ${isDown && !isUp ? "dashed" : "solid"} ${color}`,
          background: isSel ? "linear-gradient(180deg, #7a3a14 0%, #4a210b 100%)" : "linear-gradient(180deg, #45321f 0%, #2b1e13 100%)", color: INK.hi, opacity: dim ? 0.3 : 1,
          boxShadow: isSel ? "0 0 10px rgba(255,140,50,0.55)" : "inset 0 1px 0 rgba(255,225,170,0.10), 0 1px 2px rgba(0,0,0,0.6)",
          fontWeight: r.t === "B" || r.t === "M" || r.t === "T" || isSel ? 700 : 400,
          transition: theme.motion.hover, position: "relative", zIndex: 1, maxWidth: "100%",
        }}
      >{r.n}{r.v === 0 ? " ?" : ""}</div>
    );
  };
  const link = (i: number, extra?: string, c?: string) => (ok(i) ?
    <div key={"k" + i + (extra || "")} onClick={() => setSel(i)} style={{ ...theme.font.label, fontFamily: BODY, fontSize: "13px", cursor: "pointer", display: "inline-flex", gap: 4, alignItems: "baseline", padding: "3px 8px", borderRadius: 4, border: `2px solid ${c || "#6e5232"}`, background: "linear-gradient(180deg, #4a3522 0%, #2e2015 100%)", color: INK.hi, boxShadow: "0 1px 2px rgba(0,0,0,0.45)" }}>
      {extra ? extra + " " : ""}{D[i].n} <span style={{ color: "#cdb98f" }}>· {LANES[D[i].l]}</span>
    </div> : null
  );
  const row = (label: string, body: ReactNode, k: string) => (
    <div key={k} style={{ ...theme.font.body2, fontFamily: BODY, color: "#3b2a18", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "baseline", marginBottom: 4 }}>
      <span style={{ ...parchMeta, minWidth: 90 }}>{label}</span>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "baseline", flex: "1 1 200px" }}>{body}</div>
    </div>
  );
  const wrapL = (els: ReactNode[]) => <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{els}</div>;
  const ul = (i: number) => (ok(i) ? <span onClick={() => setSel(i)} style={{ textDecoration: "underline", cursor: "pointer", color: "#6a3211" }}>{D[i].n}</span> : null);
  const TN: Record<string, string> = { H: "Haldor", h: "Hildir", W: "Bog Witch" };

  const srcRows = (r: N): ReactNode[] => r.src.map((t: string, k: number) => {
    const c = t[0], body = t.slice(1);
    if (c === "g") {
      const at = body.indexOf("@");
      const objs = at >= 0 ? body.slice(0, at) : body;
      return row("Gathered", <span>{objs ? objs.split(",").join(", ") : "picked up / harvested in the world"}{at >= 0 ? <span> · needs {ul(b(body.slice(at + 1)))}</span> : null}</span>, "s" + k);
    }
    if (c === "f") return row("Found in", <span>{body.split("").map((x: string) => LANES[+x]).join(", ")} (chests, ruins)</span>, "s" + k);
    if (c === "t") {
      const at = body.indexOf("@");
      const price = at >= 0 ? body.slice(1, at) : body.slice(1);
      return row("Bought from", <span>{ul(TRIDX[body[0]])} for {price} Coins{at >= 0 ? <span> · available after {ul(b(body.slice(at + 1)))}</span> : null}</span>, "s" + k);
    }
    if (c === "v") return row("Sell", <span>to any trader (Haldor, Hildir, Bog Witch) for {body} {ul(COINS)} each</span>, "s" + k);
    if (c === "l") return row("Laid by", link(b(body), "", KC.o), "s" + k);
    if (c === "e") return row("Upgrades", link(b(body), "", KC.b), "s" + k);
    if (c === "k") return row("Key", link(b(body), "", KC.o), "s" + k);
    if (c === "b") return row("Bait", link(b(body), "", KC.o), "s" + k);
    return row("Note", <span>{body}</span>, "s" + k);
  });

  const panel = () => {
    if (sel === null) return null;
    const r = D[sel];
    const cre = isCre(sel);
    const built = isBuilt(sel);
    const shown = new Set<number>();
    const craftedHere = r.t === "S" ? DOWNS[sel].filter((u: number) => !isBuilt(u) && D[u].st.indexOf(sel) >= 0) : [];
    const builtNear = r.t === "S" ? DOWNS[sel].filter((u: number) => isBuilt(u) && D[u].st.indexOf(sel) >= 0 && UPGR[sel].indexOf(u) < 0) : [];
    const gated = GATES[sel];
    const sells = SELLS[sel];
    const spentAt = sel === COINS ? Object.keys(TRIDX).map((k: string) => TRIDX[k]).filter(ok) : [];
    [...craftedHere, ...builtNear, ...UPGR[sel], ...gated, ...sells.map((s: [number, string, number]) => s[0]), ...spentAt].forEach((x: number) => shown.add(x));
    if (cre) r.dr.forEach((d: string[]) => shown.add(b(d[0])));
    if (r.t === "T") shown.add(COINS);
    const uses = DOWNS[sel].filter((u: number) => !shown.has(u));
    const raw = depth === "all" ? Array.from(upSet).filter((n: number) => UPS[n].length === 0) : [];
    const stations = r.st.filter((s: number) => s >= 0);
    const stTxt = stations.map((s: number) => D[s].n).join(" → ");
    const ext = r.src.filter((t: string) => t[0] === "e").map((t: string) => b(t.slice(1)));
    const xr = r.ex.filter((t: string) => "uap".indexOf(t[0]) >= 0);
    const fuel = r.ex.filter((t: string) => t[0] === "F").map((t: string) => b(t.slice(1)));
    const sec = (title: string, body: ReactNode) => <div><div style={h3}>{title}</div>{body}</div>;
    return (
      <div ref={panelRef} key="panel" style={{ border: "1px solid #8a6a3e", borderRadius: 6, padding: 14, background: `${NOISE}, radial-gradient(ellipse at 50% 35%, #f1e3c0 0%, #e4cf9f 65%, #c8aa72 100%)`, boxShadow: "inset 0 0 30px rgba(110,70,30,0.45), 0 3px 10px rgba(0,0,0,0.6)", color: INK.dark, fontFamily: BODY, width: "100%", boxSizing: "border-box", position: "relative", zIndex: 2 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontFamily: RUNE, fontSize: "22px", lineHeight: "28px", fontWeight: 700, letterSpacing: "0.02em", color: INK.dark }}>{r.n}</div>
            <div style={parchMeta}>{LANES[r.l]} · {GL[r.t]}{r.sub ? ` · ${SUB_EN[r.sub] || r.sub}` : ""}{r.eats.length ? " · tameable" : ""}</div>
          </div>
          <div onClick={() => setSel(null)} style={pill(false)}>Close ✕</div>
        </div>
        {cre && r.rec.length > 0 && sec("Summoning (altar offering)", wrapL(r.rec.map((x: number[]) => link(x[0], `${x[1]}×`, KC.o))))}
        {!cre && !built && (r.rec.length > 0 || r.st.length > 0) && sec(
          `Crafted ${r.st[0] === -1 ? "by hand (inventory)" : `at ${stTxt || "—"}`}${r.lvl > 1 ? ` (station level ${r.lvl})` : ""}${r.y > 1 ? ` · makes ${r.y}` : ""}`,
          wrapL([...stations.map((s: number) => link(s, "station:", KC.c)), ...r.rec.map((x: number[]) => link(x[0], `${x[1]}×`, KC.c))]),
        )}
        {built && sec(
          `Built with the Hammer${stations.length ? ` near ${stTxt}` : " (no station needed nearby)"}${r.lvl > 1 ? ` (level ${r.lvl})` : ""}`,
          wrapL([...(HAMMER >= 0 ? [link(HAMMER, "tool:", KC.b)] : []), ...stations.map((s: number) => link(s, "near:", KC.b)), ...r.rec.map((x: number[]) => link(x[0], `${x[1]}×`, KC.b))]),
        )}
        {xr.length > 0 && sec("Upgrades, alternative recipes & Forge of Potential", <div>{xr.map((t: string, k: number) => { const p = t.slice(1).split("~"); return row(xl(t), wrapL([...(p[1] ? p[1].split(">").map((s: string) => link(b(s), "station:", KC.c)) : []), ...(p[2] ? p[2].split(",").map((x: string) => { const q = x.split("*"); return link(b(q[0]), `${q.length > 1 ? q[1] : "1"}×`, KC.c); }) : [])]), "x" + k); })}</div>)}
        {fuel.length > 0 && sec("Fuel", wrapL(fuel.map((j: number) => link(j, "", KC.o))))}
        {ext.length > 0 && sec("Upgrades station", wrapL(ext.map((s: number) => link(s, "→", KC.b))))}
        {DROPPERS[sel].length > 0 && sec("Dropped by", wrapL(DROPPERS[sel].map((d: [number, string, string]) => link(d[0], `${d[1]}% · ${d[2]}×`, KC.d))))}
        {sel === COINS && VALS.length > 0 && sec("Sell valuables to any trader", wrapL(VALS.map((v: [number, string]) => link(v[0], `${v[1]} Coins ←`, KC.t))))}
        {r.src.length > 0 && sec("Other sources & notes", srcRows(r))}
        {spentAt.length > 0 && sec("Spent at", wrapL(spentAt.map((t: number) => link(t, "→", KC.t))))}
        {r.t === "T" && sec("Paid with", wrapL([link(COINS, "", KC.t)]))}
        {sells.length > 0 && sec(`Sells (${sells.length})`, wrapL(sells.map((s: [number, string, number]) => link(s[0], `${s[1]} Coins${ok(s[2]) ? ` · after ${D[s[2]].n}` : ""} →`, KC.t))))}
        {r.t === "T" && VALS.length > 0 && sec("Buys valuables (same price at all traders)", wrapL(VALS.map((v: [number, string]) => link(v[0], `${v[1]} Coins ←`, KC.t))))}
        {cre && r.dr.length > 0 && sec(`Drops (${r.dr.length})`, wrapL(r.dr.map((d: string[]) => link(b(d[0]), `${d[1] || "100"}% · ${d[2] || "1"}×`, KC.d))))}
        {r.eats.length > 0 && sec("Taming – eats", wrapL(r.eats.map((e: number) => link(e))))}
        {gated.length > 0 && sec(`Unlocks at traders (${gated.length})`, wrapL(gated.map((u: number) => link(u, "→", KC.g))))}
        {craftedHere.length > 0 && sec(`Crafted here (${craftedHere.length})`, wrapL(craftedHere.map((u: number) => link(u, D[u].lvl > 1 ? `lvl ${D[u].lvl} →` : "→", KC.c))))}
        {UPGR[sel].length > 0 && sec(`Upgrades for this station – built with the Hammer nearby (${UPGR[sel].length})`, wrapL(UPGR[sel].map((u: number) => link(u, "→", KC.b))))}
        {builtNear.length > 0 && sec(`Built with the Hammer near this (${builtNear.length})`, wrapL(builtNear.map((u: number) => link(u, "→", KC.b))))}
        {uses.length > 0 && sec(`Used in (${uses.length})`, wrapL(uses.map((u: number) => {
          const rec = D[u].rec.find((x: number[]) => x[0] === sel);
          const k = EK.get(sel + ">" + u) || "o";
          const verb = k === "b" ? "build" : k === "c" ? "craft" : "";
          const xv = EXV.get(sel + ">" + u);
          return link(u, rec ? `${rec[1]}× ${verb ? verb + " " : ""}→` : xv ? `${xv} →` : verb ? `${verb} →` : "→", KC[k]);
        })))}
        {raw.length > 0 && sec("All raw sources in the chain", <div style={{ ...theme.font.body2, fontFamily: BODY, color: "#3b2a18" }}>{raw.map((n: number) => `${D[n].n} (${LANES[D[n].l]})`).join(", ")}</div>)}
        {r.note && <div style={{ ...theme.font.body2, fontFamily: BODY, color: "#3b2a18", marginTop: 10 }}>{r.note}</div>}
        <div style={{ ...parchMeta, marginTop: 10 }}>{r.v === 2 ? "Verified: valheim.tools, 28 Oct 2026" : r.v === 1 ? "Source: valheim.source.gs (Valheim 1.0.20), read 28 Oct 2026" : "Unverified – CSV or general game knowledge only"}</div>
      </div>
    );
  };

  const lane = (li: number) => {
    const idxs = D.map((_r: N, i: number) => i).filter((i: number) => D[i].l === li && visible[i]);
    if (!idxs.length) return null;
    const hot = sel !== null && idxs.some((i: number) => i === sel || upSet.has(i) || downSet.has(i));
    const B = BIOME[li];
    return (
      <div key={"l" + li} style={{ flex: wide ? "0 0 250px" : "1 1 auto", width: wide ? 250 : "100%", boxSizing: "border-box", border: `1px solid ${hot ? B[2] : "#5c4329"}`, borderRadius: 6, padding: 10, background: `radial-gradient(ellipse at 50% 0%, ${B[2]}40 0%, transparent 62%), ${GRAIN}, linear-gradient(180deg, ${B[0]} 0%, ${B[1]} 100%)`, boxShadow: hot ? `0 0 14px ${B[2]}55, inset 0 0 18px rgba(0,0,0,0.45)` : "inset 0 0 18px rgba(0,0,0,0.55), 0 2px 6px rgba(0,0,0,0.35)", position: "relative" }}>
        <div style={{ fontFamily: RUNE, fontSize: wide ? "16px" : "18px", lineHeight: "22px", fontWeight: 700, letterSpacing: "0.04em", color: INK.hi, textShadow: `0 0 10px ${B[2]}66, 0 1px 2px #000` }}><span style={{ fontFamily: RUNIC, fontWeight: 400, color: B[2], marginRight: 6 }}>{BRUNE[li]}</span>{li < 8 ? `${li + 1}. ` : ""}{LANES[li]}</div>
        <div style={{ ...muted, marginBottom: 4 }}>{LANE_SUB[li]} · {idxs.length}/{COUNTS[li]}</div>
        {GROUPS.map(([g, label]: [string, string]) => {
          const gi = idxs.filter((i: number) => D[i].t === g);
          if (!gi.length) return null;
          const isClosed = closed.indexOf(g) >= 0 && !ql;
          const shown = isClosed ? gi.filter((i: number) => i === sel || upSet.has(i) || downSet.has(i)) : gi;
          return (
            <div key={g} style={{ marginTop: 8 }}>
              <div onClick={() => setClosed((c: string[]) => toggle(c, g))} style={{ ...muted, marginBottom: 4, cursor: "pointer", userSelect: "none" }}>{isClosed ? "▸" : "▾"} {label} ({gi.length}){isClosed && shown.length ? ` · ${shown.length} linked` : ""}</div>
              {shown.length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>{shown.map((i: number) => chip(i))}</div>}
            </div>
          );
        })}
      </div>
    );
  };

  const flow = () => {
    const els: ReactNode[] = [];
    for (let li = 0; li < LANES.length; li++) {
      els.push(lane(li));
      if (!wide && sel !== null && D[sel].l === li) els.push(panel());
    }
    return (
      <div ref={wrapRef} style={{ width: "100%" }}>
        {wide && sel !== null && <div style={{ marginBottom: 12 }}>{panel()}</div>}
        <div className="vh-scroll" style={{ overflowX: wide ? "auto" : "visible", width: "100%", maxWidth: "100%", paddingBottom: wide ? 8 : 0, scrollbarColor: "#7a5a36 transparent" }}>
          <div ref={contentRef} style={{ position: "relative", display: "flex", flexDirection: wide ? "row" : "column", alignItems: wide ? "flex-start" : "stretch", gap: wide ? 30 : 14, width: wide ? "max-content" : "100%" }}>
            {els}
            <svg width={box[0]} height={box[1]} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none", zIndex: 3, overflow: "visible" }}>
              {paths.map((p: Seg, k: number) => <path key={k} d={p.d} fill="none" stroke={p.c} strokeWidth={2} strokeOpacity={0.85} strokeDasharray={p.dash ? "5 4" : undefined} />)}
            </svg>
          </div>
        </div>
      </div>
    );
  };

  const typeCount = (g: string) => D.filter((r: N) => r.t === g).length;

  const frame: CSSProperties = { position: "relative", borderRadius: 8, border: "2px solid #120c07", outline: "1px solid #6b5233", outlineOffset: -6, padding: wide ? "16px 14px 14px" : "14px 8px 12px", background: `radial-gradient(ellipse at 50% -8%, rgba(216,207,120,0.16) 0%, transparent 48%), radial-gradient(ellipse at 50% 112%, rgba(255,120,40,0.16) 0%, transparent 46%), ${NOISE}, ${GRAIN}, linear-gradient(180deg, #2c241c 0%, #120e0a 100%)`, boxShadow: "inset 0 0 70px rgba(0,0,0,0.75), 0 4px 18px rgba(0,0,0,0.45)", color: INK.hi, fontFamily: BODY };
  return (
    <Page
      title="Valheim Progression"
      width="full"
      skin="valheim"
      summary="Every creature, gatherable, material, food, piece of gear, station and trader by biome (left to right on desktop, top to bottom on a phone). Tap anything: solid lines and outlines show where it comes from, dashed ones show what it leads to; line colour shows the relation type."
      sources={["valheim.source.gs (Valheim 1.0.20), read 28 Oct 2026", "valheim.tools (verified 28 Oct 2026)", "Rimmo's CSV (1477 rows), corrected", "Audit 28 Oct 2026: Jotunn datamine, Fandom wiki, valheim.tools browser checks"]}
    >
      <style>{SKIN_CSS}</style>
      <div style={frame}>
        {rivet({ top: 4, left: 4 })}{rivet({ top: 4, right: 4 })}{rivet({ bottom: 4, left: 4 })}{rivet({ bottom: 4, right: 4 })}
      <Section heading="Biome flow">
        <Input label="Search" value={q} onChange={(v: string) => setQ(v)} placeholder="e.g. Bone Fragments, Raspberries, Troll, Haldor" />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
          <span style={muted}>Show types:</span>
          {GROUPS.map(([g, label]: [string, string]) => (
            <div key={g} onClick={() => setHidden((h: string[]) => toggle(h, g))} style={pill(hidden.indexOf(g) < 0)}>{label} {typeCount(g)}</div>
          ))}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
          <span style={muted}>Groups:</span>
          <div onClick={() => setClosed([])} style={pill(false)}>Expand all</div>
          <div onClick={() => setClosed(GROUPS.map((g: [string, string]) => g[0]))} style={pill(false)}>Collapse all</div>
          <div onClick={() => setClosed(DEF_CLOSED)} style={pill(false)}>Default</div>
          <div onClick={() => setHidden([])} style={pill(false)}>All types</div>
        </div>
        <Segmented options={[{ value: "1", label: "Direct links" }, { value: "all", label: "Whole chain" }]} value={depth} onChange={(v: string) => setDepth(v)} />
        <Legend names={KINDS.map((k: [string, string]) => k[1])} />
        <Text>{`${visCount} / ${D.length} entries visible. Solid line = source or ingredient of the selected entry; dashed line = what it is used for. Crafted means made from a recipe at a crafting station (or by hand); built means placed with the Hammer using materials, with the named station nearby. Tap a collapsed group header to open it; linked entries always show. "?" = unverified.`}</Text>
        {flow()}
      </Section>
      <Section heading="Data and corrections" collapsible defaultOpen={false}>
        <Table columns={["Biome", "Entries"]} rows={LANES.map((l: string, i: number) => [l, String(COUNTS[i])])} />
        <Text>{"Biome = the progression tier where you can first reasonably get the thing: creatures by their native biome; drops by the earliest creature; gatherables and ores by biome and the tool they need (e.g. Finewood needs a Bronze Axe → Black Forest); crafted and built things by their latest ingredient or station; trader stock by the trader's biome or its unlock (boss or Hildir's returned chest)."}</Text>
        <Table columns={["What", "Change"]} rows={[["Audit 28 Oct (v8)", "All 1068 entries re-checked against valheim.source.gs (1.0.20), the Jotunn datamine and the Fandom wiki, plus valheim.tools in the browser for the open points. Now 1098 entries: 29 missing “Cast: …” intermediates of the Deep North casting chain and the Birds' Nest were added; 123 real errors fixed (lane, name, station, recipe, build, drop or missing source)"], ["New relation types", "Upgrade costs (quality 2–4) for 201 items, alternative recipes (e.g. Bronze 10 Copper + 5 Tin → 5, Smelter Scrap Bronze/Copper Scrap/Scrap Iron, Iron Cooking Station), Forge of Potential idols, station fuel (e.g. Bone Fragments and Charred Bone → Shield Generator, Coal → Smelter), Ballista/Catapult ammo, planting and the Obliterator. Shown in the item panel and as links"], ["Key lane changes", "Bone Fragments, Skeleton, Skeleton Trophy, Bone Tower Shield, Deer Hide Cape → Meadows (Dolmen skeletons, Stone graves). Bronze idols → Black Forest; Iron/Silver/Black Metal/Black Marble idols one biome later (0% in the earlier biome's chests). Seagull Ocean → Meadows (spawns on Meadows coasts, reachable from the start). Deer White and its trophy → Black Forest"], ["Boss rule", "Killing a boss = moving on: anything that only appears after a boss is killed belongs to the next biome. Greydwarf, Greydwarf Eye and Greydwarf Trophy stay in Black Forest (Greydwarfs only roam the Meadows after Eikthyr). Post-boss trader stock moved one biome on: Thunder Stone and Ymir Flesh → Swamp (after The Elder); Wider Pockets, Fragrant Bundle, Mountain Peak Pepper Powder, Toadstool, Scythe Handle → Plains (after Moder); Grasslands Herbalist Harvest → Mistlands (Yagluth); Deeper Pockets, Herbs of the Hidden Hills → Ashlands (The Queen); Fiery Spice Powder → Deep North (Fader). Follow-ons: Hearty Mountain Logger's Stew, Mead base: Berserkir, Berserkir Mead, Scythe → Plains; Plains Pie Picnic → Mistlands; Mushrooms Galore → Ashlands; Ashlands Gourmet Bowl → Deep North. Egg stays in Plains (Sealed Tower chest, Hens). Boss drops stay with their boss"], ["Console-only", "Riktig Fuling, Larva and Blue Mushroom exist only through console commands (Blue Mushroom's pickable never generates). They stay in their nominal biome without any links"], ["Browser-verified (valheim.tools)", "Deer White: rare passive Black Forest variant, 30 HP, 2 Deer Meat + trophy 100%, spawn unconfirmed. Ice Skates / Ice Shoes: found in the Deep North, exact source unknown. Frostcore: Frost Core Hangers in Mountain frost caves (do not regrow) + Frysling 100%. Midsummer Crown (event only) and Pointy Hat recipes and upgrades. Bloodgold idols: rare Deep North chest loot. Seagull, Crow, Ash Crow: 3 Feathers 100%. Leviathan: 3–4 Chitin per barnacle. Wider/Deeper Pockets 1000/2000 Coins. Yggdrasil Wood: Black Metal Axe or better. Club upgrades 5/10/20 Bone Fragments. Thungr Trophy from the Zil & Thungr fight"], ["Nord weapons", "Forge of Potential uses the Bloodgold Battle Idol (not Black Metal); e.g. Nord Sword past quality 4: 1 idol + 45 Bloodgold + 22 Timberwood. Nord Sword is cast at Black Forge level 4 (20 Bloodgold, 10 Timberwood, Mould) → Frost Foundry; upgrades at Black Forge 5/6/7"], ["Ballista & Catapult", "Ballista: Hammer near Workbench, 10 Black Metal, 10 Yggdrasil Wood, 3 Mechanical Spring; ammo Wooden, Black Metal, Flametal and Bloodgold Missile. Catapult: 20 Ashwood, 10 Flametal, 1 Charred Cogwheel; ammo Grausten, Explosive and Bloodgold Payload. Each ammo sits in the biome of its latest ingredient or station"], ["Names", "Mead Cauldron → Mead Ketill (in-game name; the earlier note was wrong). “Root (olend)” → Root (creature). The Kvastur trophy is listed as “Kvastur Trophy” to keep it apart from the miniboss (in game the item is just “Kvastur”)"], ["Loops avoided", "Two alternative inputs are shown as text only because a link would create a loop: Finewood → Coal and Copper Scrap → Copper"], ["Scope", "Turn 1: 183 hand-picked entries → now 1098 (after the audit): every non-decorative row of the CSV plus functional stations, upgrades, ships, beds, chests and the three traders"], ["Creatures", "110 creatures: regular, animals, tameables, minibosses (Brenna, Geirrhafa, Zil, Thungr, Kvastur, Lord Reto), Ocean (Serpent, Leviathan); each linked to its drops"], ["Coins (fixed)", "Coins used to show only the creatures that drop them. Now: sources = creature drops, chests in every biome and selling 9 valuables; uses = Haldor, Hildir and the Bog Witch, each linked to everything they sell with prices and unlocks (valheim.tools/traders)"], ["Traders (new)", "Hildir (camp in the Meadows on another island – needs a boat, so placed at the Black Forest stage; 38 items), Haldor (Black Forest, 11 items incl. Wider Pockets 1000 and Deeper Pockets 2000), Bog Witch (Swamp, 20 items). Boss unlocks and Hildir's returned chests are linked as unlock edges"], ["Valuables", "Amber 5, Amber Pearl 10, Ancient Coin 10, Ruby 20, Silver Necklace 30, Grimvarn 55, Solryth 95, Veydris 135, Draumyx 175 Coins – any of the three traders buys them at the same price"], ["Hildir's stock", "Items unlocked by the Brass Chest (Smouldering Tomb, Black Forest), Silver Chest (Howling Cavern, Mountain) and Bronze Chest (Sealed Tower, Plains) moved to that chest's biome"], ["Crafted vs built", "Two separate relation types: crafted from a recipe at a crafting station (or by hand), and built with the Hammer from materials with a station nearby. Stations and station upgrades are built; upgrades link from the station they improve instead of feeding into it"], ["Station upgrades (fixed)", "Before, an upgrade appeared as a source of its station (e.g. Chopping Block → Workbench), which made loops. Now Workbench → Chopping Block (built nearby, upgrades it)"], ["Yggdrasil Wood (fixed)", "Required tool was Jotun Bane, but Jotun Bane is made from Yggdrasil Wood (a loop). valheim.tools: Black Metal Axe or better"], ["Biome audit (found in)", "Putrid Hole (Morgen holes) was mapped to Deep North instead of Ashlands, and 7 dungeons were missing. Fixed on 18 entries, e.g. Ashwood, Charred Bone, Molten Core now found in Ashlands, not Deep North"], ["Lane rule", "Each entry sits in the EARLIEST biome where it can be obtained by any means: gathered or found, creature drop, chest loot, bought from a trader (trader's biome, after its unlock), or crafted/built (earliest biome where every ingredient AND the station at the required level are available). Computed as a fixed point over the whole graph; Ocean is a side lane only for things obtainable only at sea. No 'Multiple' lane: Amber, Amber Pearl, Coins, Ruby and Silver Necklace sit in Meadows with all chest locations listed under found in. 7 entries moved: Poison Arrow Mountain → Swamp (Swamp chest loot), Scrap Bronze Black Forest → Ashlands (only from Charred Fortress walls), Midsummer Crown → Meadows, Perch Meadows → Black Forest (rod and bait from Haldor), Trollfish → Swamp (Mossy bait needs the Food Preparation Table), Corked Vial and Woodland Herb Blend → Swamp (Bog Witch). Full list in lane_diff_v5.csv"], ["Boat rule", "Hildir is in the Meadows but never on the starting island, so reaching her needs a boat (Karve, Black Forest stage): Hildir and her items with no unlock (Headband, Simple Purple/Red Cap, Simple Undyed Dress/Tunic, Sparkler, Barber Kit, Iron Pit) moved Meadows → Black Forest, plus Iron Fire Pit (built from Iron Pit). Items that unlock with her chests stay in the chest's biome. Ocean items likewise count as needing a boat (Black Forest stage or later). Poison Arrow stays in Swamp: Swamp ruin and grave chest loot confirmed on valheim.tools and by the user. List in lane_diff_v6.csv"], ["Fireworks and cooking", "6 coloured Fireworks → Plains (need Basic Fireworks from Hildir after the Bronze Chest). 8 cooked foods: Cooking Station instead of Iron Cooking Station"], ["Hildir's keys", "Removed: never obtainable in a normal game (valheim.tools); Hildir unlocks her returned chests herself"], ["Nord gear", "All Nord weapons, shields, staves and armor (cast from a mould → Frost Foundry) plus Frostfire/Thunderblood variants"], ["Captive Fuling", "Plains → Deep North (Morkhalla dungeon, valheim.tools)"], ["Hen, Chicken, Egg", "Meadows → Plains (Egg: Haldor after Yagluth; chickens hatch from eggs)"], ["Finewood, Bronze Axe etc.", "Meadows → Black Forest: birch and oak need a Bronze Axe"], ["Copper Scrap", "Black Forest → Mistlands (Ancient Armour/Sword, Black Metal Pickaxe)"], ["Fader Relic", "Merged with Kindled Ribs (renamed in 1.0.15)"], ["Yagluth offering", "5 Fuling Totems – confirmed on valheim.tools"], ["Browser check (28 Oct)", "verify_list.csv checked against valheim.tools item/creature pages: 44 corrections on 39 entries, 111 entries newly marked verified. Examples: Crow → Black Forest (3 Feathers); Seagull later moved to Meadows by the audit; Midsummer Crown and Pointy Hat are Workbench recipes (seasonal, Black Forest); asksvin bones from carrion at Morgen Holes → new Asksvin Skeleton; Moose meat 4–6, hide/sinew 2–3; Seal pelt/blubber 2–3; Captive Fuling Ancient Coin 100% ×1–2; The Void drops only Ectoplasm; Pike also takes Cold Fishing Bait"], ["Coins sources (fixed)", "Meat Pile and Coin Pile removed as Coins sources (Coin Pile is a build piece made from Coins). Troll carries 20–30 Coins"], ["Riktig Fuling", "Console-only, never spawns in a normal world: drops removed so it has no links (same handling now for Larva and Blue Mushroom)"], ["Bronze Nails", "Makes 20 (turn 1 said 10); Iron Nails 10"], ["Left out", "Decorative build pieces, stacks, rugs, banners; places; 29 internal/unused/unobtainable rows (e.g. Skelett, Stone Pickaxe, The Hive, Bonemaw Scale, Hooded Lantern, summoned creatures, Hildir's keys)"], ["Biome differences", "Many entries sit in a different progression biome than the CSV biome – full list in lane_diff.csv"]]} />
        <Callout tone="info" lead="Open points">{"No entries are unverified any more (328 verified on valheim.tools, 770 from valheim.source.gs 1.0.20). Still unknown: Deer White spawn location (rare variant, spawn unconfirmed), the exact source of Ice Skates and Ice Shoes, and Nord Sword upgrade costs (Black Forge 5/6/7). Upgrade costs are not recorded for the other Nord gear. Not shown: Fermenter yields, specific chest/dungeon names and decorative build pieces."}</Callout>
      </Section>
      </div>
    </Page>
  );
}
