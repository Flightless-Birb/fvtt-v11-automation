//------------ pack tactics - flags.midi-qol.advantage.attack.all
//game.canvas.tokens.placeables.find(t => t.actor && !((t.actor?.system?.details?.type?.value === "custom" || t.actor?.system?.details?.type?.value === "") && t.actor?.system?.details?.type?.custom === "") && t.id !== canvas.tokens.controlled[0].id && t.id !== game.user.targets?.first().id && canvas.tokens.controlled[0].disposition === t.disposition && t.actor?.system?.attributes?.hp?.value > 0 && !(t.actor?.effects?.find(e => ["Incapacitated", "Unconscious", "Paralyzed", "Petrified", "Stunned"].includes(e.label))) && MidiQOL.getDistance(t, game.user.targets?.first(), false) <= 5)
//game.canvas.tokens.placeables.find(t=>t.actor&&!((t.actor?.system?.details?.type?.value==="custom"||t.actor?.system?.details?.type?.value==="")&&t.actor?.system?.details?.type?.custom==="")&&t.id!==canvas.tokens.controlled[0].id&&t.id!==game.user.targets?.first().id&&canvas.tokens.controlled[0].disposition===t.disposition&&t.actor?.system?.attributes?.hp?.value>0&&!(t.actor?.canvas.tokens.get(tokenId)?.actor?.items?.find(i=>i.id==workflow?.itemId)?.effects?.find(e=>["Incapacitated","Unconscious","Paralyzed","Petrified","Stunned"].includes(e.label)))&&MidiQOL.getDistance(t,game.user.targets?.first(),false)<=5)
//game.canvas.tokens.placeables.find(t=>t.actor&&!((t.actor?.system?.details?.type?.value==="custom"||t.actor?.system?.details?.type?.value==="")&&t.actor?.system?.details?.type?.custom==="")&&t.id!==workflow.token.id&&t.id!==[...workflow.targets][0].id&&t.disposition===[...workflow.targets][0].disposition&&t.actor?.system?.attributes?.hp?.value>0&&!t.actor?.canvas.tokens.get(tokenId)?.actor?.items?.find(i=>i.id==workflow?.itemId)?.effects?.find(e=>["Incapacitated","Unconscious","Paralyzed","Petrified","Stunned"].includes(e.label))&&MidiQOL.getDistance(t,[...workflow.targets][0],false)<10)
//game?.canvas?.tokens?.placeables?.find(t=>t.actor&&!((t.actor?.system?.details?.type?.value=="custom"||t.actor?.system?.details?.type?.value=="")&&t.actor?.system?.details?.type?.custom=="")&&t!=workflow.token&&t!=[...workflow.targets][0]&&t?.document?.disposition==workflow.token?.document?.disposition&&!MidiQOL.checkIncapacitated(t.actor)&&MidiQOL.computeDistance(t,[...workflow.targets][0],false)<10)
game.canvas.tokens.placeables.find(t=>t.actor&&MidiQOL.typeOrRace(t.actor)&&t.id!=tokenId&&t.id!=targetId&&t?.document?.disposition==canvas.tokens.get(tokenId)?.document?.disposition&&!MidiQOL.checkIncapacitated(t.actor)&&MidiQOL.computeDistance(t,canvas.tokens.get(targetId),false)<10)

//-------- blood frenzy - flags.midi-qol.advantage.attack.all
//game.user.targets?.first()?.actor?.system?.attributes?.hp?.value < game.user.targets?.first()?.actor?.system?.attributes?.hp?.max
//game.user.targets?.first()?.actor?.system?.attributes?.hp?.value<game.user.targets?.first()?.actor?.system?.attributes?.hp?.max
//-------- [...workflow.targets][0].actor.system.attributes.hp.value<[...workflow.targets][0].actor.system.attributes.hp.max
target.attributes.hp.value<target.attributes.hp.max

//--------- ambusher - flags.midi-qol.advantage.attack.all
//game.combat?.round === 1 && game.user.targets?.first()?.actor?.effects?.find(e => e.label === "Surprised")
//game.combat?.round===1&&game.user.targets?.first()?.actor?.effects?.find(e=>e.label==="Surprised")
game.combat?.round===1&&canvas.tokens.get(targetId).actor.effects.find(e=>e.name=="Surprised")

//----------- chill touch - flags.midi-qol.disadvantage.attack.all
//(["undead"].includes(canvas.tokens.controlled[0].actor.system.details?.race?.toLowerCase())||["undead"].includes(canvas.tokens.controlled[0].actor.system.details?.type?.value?.toLowerCase()))&&game.user.targets?.first()?.id=="@token"
MidiQOL.typeOrRace(actorUuid)?.toLowerCase().includes("undead")&&targetId=="@token"

//---------- paralyzed - flags.midi-qol.grants.critical.all
//MidiQOL.getDistance(workflow.token,[...workflow.targets][0],false)<10
MidiQOL.computeDistance(canvas.tokens.get(tokenId),canvas.tokens.get(targetId),false)<10

//--------- assassiante - flags.midi-qol.advantage.attack.all + flags.midi-qol.critical.mwak
//game.combat?.round===1&&game.combat.turn<Object.entries(game.combat.turns).find(i=>i[1].tokenId===game.user.targets?.first().id)[0]
//game.combat?.round===1&&game.user.targets?.first()?.actor?.effects?.find(e=>e.label==="Surprised")
game.combat?.round===1&&game.combat.turn<Object.entries(game.combat.turns).find(t=>t[1].tokenId==targetId)[0]
game.combat?.round===1&&workflow?.targets&&canvas.tokens.get(targetId).actor?.effects?.find(e=>e.name=="Surprised")

//-------blur flags.midi-qol.grants.disadvantage.attack.all
//MidiQOL.getDistance(workflow.token,[...workflow.targets][0],false)>Math.max(workflow.actor.attributes.senses.blindsight,workflow.actor.attributes.senses.tremorsense,workflow.actor.attributes.senses.truesight)
MidiQOL.computeDistance(workflow.token,[...workflow.targets][0],false)>Math.max(workflow.actor.attributes.senses.blindsight,workflow.actor.attributes.senses.tremorsense,workflow.actor.attributes.senses.truesight)

//------protection from evil and good flags.midi-qol.grants.disadvantage.attack.all
["aberration","celestial","elemental","fey","fiend","undead"].find(t=>MidiQOL.typeOrRace(actorUuid)?.toLowerCase().includes(t))

//-------frightened flags.midi-qol.disadvantage.attack.all
//workflow.actor.flags["midi-qol"].frightened.split("Actor.").find(f => MidiQOL.canSense(workflow.token, canvas.tokens.placeables.find(p => p.actor && p.actor.id == f))) // USING FRIGHTENED FLAG
//workflow.actor.effects.find(e=>e.label=="Frightened"&&MidiQOL.canSense(workflow.token,canvas.tokens.placeables.find(t=>t.actor&&t.actor.id==e.origin.match(/Actor\.(.*?)\./)[1])))
//effects.find(e=>e.name=="Frightened"&&MidiQOL.canSense(canvas.tokens.get(tokenId),canvas.tokens.placeables.find(t=>t.actor&&(t.actor.id==e.origin.match(/Actor\.(.*?)\./)[1]))))
effects.find(e=>e.name=="Frightened"&&MidiQOL.canSee(canvas.tokens.get(tokenId),canvas.tokens.placeables.find(t=>t.actor&&(t.actor.id==e.origin.match(/Actor\.(.*?)\./)[1]))))

//------mortal bulwark flags.midi-qol.advantage.attack.all
["aberration","celestial","elemental","fey","fiend"].find(t=>MidiQOL.typeOrRace(targetActorUuid)?.toLowerCase().includes(t))

//-----phalanx formation > flags.midi-qol.advantage.attack.all / flags.midi-qol.advantage.ability.save.dex
workflow?.targets&&canvas.tokens.placeables.find(t=>t.actor&&MidiQOL.typeOrRace(t.actor)&&t?.document?.disposition==canvas.tokens.get(tokenId)?.document?.disposition&&t.id!=tokenId&&t.actor.items.find(i=>i.system?.armor?.type=="shield"&&i.system?.equipped)&&MidiQOL.computeDistance(t,canvas.tokens.get(tokenId),false)<10)
workflow?.targets&&canvas.tokens.placeables.find(t=>t.actor&&MidiQOL.typeOrRace(t.actor)&&t?.document?.disposition==canvas.tokens.get(targetId)?.document?.disposition&&t.id!=targetId&&t.actor.items.find(i=>i.system?.armor?.type=="shield"&&i.system?.equipped)&&MidiQOL.computeDistance(t,canvas.tokens.get(targetId),false)<10)

//------underwater flags.midi-qol.disadvantage.attack.mwak/rwak flags.midi-qol.fail.attack.mwak/rwak
!["dagger","javelin","shortsword","spear","trident"].includes(item?.baseItem)
!["handcrossbow","lightcrossbow","heavycrossbow","net","dart"].includes(item?.baseItem)
MidiQOL.checkRange(workflow.item,workflow.token,[...workflow.targets],false).range>MidiQOL.computeDistance(workflow.token,[...workflow.targets][0],false)

//-----resistance to condition/type of item > flags.midi-qol.advantage.ability.save.all
//-charmed
canvas.tokens.get(tokenId)?.actor?.items?.find(i=>i.id==workflow?.itemId)?.effects?.find(e=>["charmed"].find(s=>e.name.toLowerCase().includes(s))||e.changes?.find(c=>["charmed"].find(s=>c.value.toLowerCase().includes(s))))||workflow?.targets&&canvas.tokens.get(targetId).actor?.effects?.find(e=>e.name==workflow?.item?.name&&e.changes?.find(c=>["charmed"].find(s=>c.value.toLowerCase().includes(s))))
//-frightened
canvas.tokens.get(tokenId)?.actor?.items?.find(i=>i.id==workflow?.itemId)?.effects?.find(e=>["frightened"].find(s=>e.name.toLowerCase().includes(s))||e.changes?.find(c=>["frightened"].find(s=>c.value.toLowerCase().includes(s))))||workflow?.targets&&canvas.tokens.get(targetId).actor?.effects?.find(e=>e.name==workflow?.item?.name&&e.changes?.find(c=>["frightened"].find(s=>c.value.toLowerCase().includes(s))))
//-blinded
canvas.tokens.get(tokenId)?.actor?.items?.find(i=>i.id==workflow?.itemId)?.effects?.find(e=>["blinded"].find(s=>e.name.toLowerCase().includes(s))||e.changes?.find(c=>["blinded"].find(s=>c.value.toLowerCase().includes(s))))||workflow?.targets&&canvas.tokens.get(targetId).actor?.effects?.find(e=>e.name==workflow?.item?.name&&e.changes?.find(c=>["blinded"].find(s=>c.value.toLowerCase().includes(s))))
//-deafened
canvas.tokens.get(tokenId)?.actor?.items?.find(i=>i.id==workflow?.itemId)?.effects?.find(e=>["deafened"].find(s=>e.name.toLowerCase().includes(s))||e.changes?.find(c=>["deafened"].find(s=>c.value.toLowerCase().includes(s))))||workflow?.targets&&canvas.tokens.get(targetId).actor?.effects?.find(e=>e.name==workflow?.item?.name&&e.changes?.find(c=>["deafened"].find(s=>c.value.toLowerCase().includes(s))))
//-stunned
canvas.tokens.get(tokenId)?.actor?.items?.find(i=>i.id==workflow?.itemId)?.effects?.find(e=>["stunned"].find(s=>e.name.toLowerCase().includes(s))||e.changes?.find(c=>["stunned"].find(s=>c.value.toLowerCase().includes(s))))||workflow?.targets&&canvas.tokens.get(targetId).actor?.effects?.find(e=>e.name==workflow?.item?.name&&e.changes?.find(c=>["stunned"].find(s=>c.value.toLowerCase().includes(s))))
//-poisoned
canvas.tokens.get(tokenId)?.actor?.items?.find(i=>i.id==workflow?.itemId)?.effects?.find(e=>["poisoned"].find(s=>e.name.toLowerCase().includes(s))||e.changes?.find(c=>["poisoned"].find(s=>c.value.toLowerCase().includes(s))))||workflow?.targets&&canvas.tokens.get(targetId).actor?.effects?.find(e=>e.name==workflow?.item?.name&&e.changes?.find(c=>["poisoned"].find(s=>c.value.toLowerCase().includes(s))))
//-paralyzed
canvas.tokens.get(tokenId)?.actor?.items?.find(i=>i.id==workflow?.itemId)?.effects?.find(e=>["paralyzed"].find(s=>e.name.toLowerCase().includes(s))||e.changes?.find(c=>["paralyzed"].find(s=>c.value.toLowerCase().includes(s))))||workflow?.targets&&canvas.tokens.get(targetId).actor?.effects?.find(e=>e.name==workflow?.item?.name&&e.changes?.find(c=>["paralyzed"].find(s=>c.value.toLowerCase().includes(s))))
//-unconscious
canvas.tokens.get(tokenId)?.actor?.items?.find(i=>i.id==workflow?.itemId)?.effects?.find(e=>["unconscious"].find(s=>e.name.toLowerCase().includes(s))||e.changes?.find(c=>["unconscious"].find(s=>c.value.toLowerCase().includes(s))))||workflow?.targets&&canvas.tokens.get(targetId).actor?.effects?.find(e=>e.name==workflow?.item?.name&&e.changes?.find(c=>["unconscious"].find(s=>c.value.toLowerCase().includes(s))))
//-incapacitated
canvas.tokens.get(tokenId)?.actor?.items?.find(i=>i.id==workflow?.itemId)?.effects?.find(e=>["incapacitated"].find(s=>e.name.toLowerCase().includes(s))||e.changes?.find(c=>["incapacitated"].find(s=>c.value.toLowerCase().includes(s))))||workflow?.targets&&canvas.tokens.get(targetId).actor?.effects?.find(e=>e.name==workflow?.item?.name&&e.changes?.find(c=>["incapacitated"].find(s=>c.value.toLowerCase().includes(s))))
//-prone
canvas.tokens.get(tokenId)?.actor?.items?.find(i=>i.id==workflow?.itemId)?.effects?.find(e=>["prone"].find(s=>e.name.toLowerCase().includes(s))||e.changes?.find(c=>["prone"].find(s=>c.value.toLowerCase().includes(s))))||workflow?.targets&&canvas.tokens.get(targetId).actor?.effects?.find(e=>e.name==workflow?.item?.name&&e.changes?.find(c=>["prone"].find(s=>c.value.toLowerCase().includes(s))))



//-duregar resilience > poisoned, charmed, paralyzed, spells
workflow?.item?.type=="spell"||canvas.tokens.get(tokenId)?.actor?.items?.find(i=>i.id==workflow?.itemId)?.effects?.find(e=>["poisoned","charmed","paralyzed"].find(s=>e.name.toLowerCase().includes(s))||e.changes?.find(c=>["poisoned","charmed","paralyzed"].find(s=>c.value.toLowerCase().includes(s))))||workflow?.targets&&canvas.tokens.get(targetId).actor?.effects?.find(e=>e.name==workflow?.item?.name&&e.changes?.find(c=>["poisoned","charmed","paralyzed"].find(s=>c.value.toLowerCase().includes(s))))
//-dark devotion > charmed, frightened
canvas.tokens.get(tokenId)?.actor?.items?.find(i=>i.id==workflow?.itemId)?.effects?.find(e=>["charmed","frightened"].find(s => e.name.toLowerCase().includes(s))||e.changes?.find(c=>["charmed","frightened"].find(s=>c.value.toLowerCase().includes(s))))||workflow?.targets&&canvas.tokens.get(targetId).actor?.effects?.find(e=>e.name==workflow?.item?.name&&e.changes?.find(c=>["charmed","frightened"].find(s=>c.value.toLowerCase().includes(s))))
//-turn defiance > turned
canvas.tokens.get(tokenId)?.actor?.items?.find(i=>i.id==workflow?.itemId)?.effects?.find(e=>["turned"].find(s=>e.name.toLowerCase().includes(s))||e.changes?.find(c=>["turned"].find(s=>c.value.toLowerCase().includes(s))))||workflow?.targets&&canvas.tokens.get(targetId).actor?.effects?.find(e=>e.name==workflow?.item?.name&&e.changes?.find(c=>["turned"].find(s=>c.value.toLowerCase().includes(s))))
//-heart of hruggek > charmed, frightened, paralyzed, poisoned, stunned, unconcsious
canvas.tokens.get(tokenId)?.actor?.items?.find(i=>i.id==workflow?.itemId)?.effects?.find(e=>["charmed","frightened","paralyzed","poisoned","stunned","unconscious"].find(s=>e.name.toLowerCase().includes(s))||e.changes?.find(c=>["charmed","frightened","paralyzed","poisoned","stunned","unconscious"].find(s=>c.value.toLowerCase().includes(s))))||workflow?.targets&&canvas.tokens.get(targetId).actor?.effects?.find(e=>e.name==workflow?.item?.name&&e.changes?.find(c=>["charmed","frightened","paralyzed","poisoned","stunned","unconscious"].find(s=>c.value.toLowerCase().includes(s))))


//-----turn immunity > flags.midi-qol.superSaver.all
canvas.tokens.get(tokenId)?.actor?.items?.find(i=>i.id==workflow?.itemId)?.effects?.find(e=>["turned"].find(s=>e.name.toLowerCase().includes(s))||e.changes?.find(c=>["turned"].find(s=>c.value.toLowerCase().includes(s))))||workflow?.targets&&canvas.tokens.get(targetId).actor?.effects?.find(e=>e.name==workflow?.item?.name&&e.changes?.find(c=>["turned"].find(s=>c.value.toLowerCase().includes(s))))
//-----fey ancestry > flags.midi-qol.superSaver.all
(workflow?.item?.type==spell||workflow?.item?.flags.midiProperties.magiceffect)&&canvas.tokens.get(tokenId)?.actor?.items?.find(i=>i.id==workflow?.itemId)?.effects?.find(e=>["unconscious"].find(s=>e.name.toLowerCase().includes(s))||e.changes?.find(c=>["unconscious"].find(s=>c.value.toLowerCase().includes(s))))||workflow?.targets&&canvas.tokens.get(targetId).actor?.effects?.find(e=>e.name==workflow?.item?.name&&e.changes?.find(c=>["unconscious"].find(s=>c.value.toLowerCase().includes(s))))



//-aura of purity >  blinded, charmed, deafened, frightened, paralyzed, poisoned, stunned
canvas.tokens.get(tokenId)?.actor?.items?.find(i=>i.id==workflow?.itemId)?.effects?.find(e=>["blinded","charmed","deafend","frightened","paralyzed","poisoned","stunned"].find(s => e.name.toLowerCase().includes(s))||e.changes?.find(c=>["blinded","charmed","deafend","frightened","paralyzed","poisoned","stunned"].find(s=>c.value.toLowerCase().includes(s))))||workflow?.targets&&canvas.tokens.get(targetId).actor?.effects?.find(e=>e.name==workflow?.item?.name&&e.changes?.find(c=>["blinded","charmed","deafend","frightened","paralyzed","poisoned","stunned"].find(s=>c.value.toLowerCase().includes(s))))
//-protection from good and evil > charmed, frightened > flags.midi-qol.superSaver.all
["aberration","celestial","elemental","fey","fiend","undead"].find(t=>MidiQOL.typeOrRace(actorUuid).toLowerCase().includes(t))&&canvas.tokens.get(tokenId)?.actor?.items?.find(i=>i.id==workflow?.itemId)?.effects?.find(e=>["charmed","frightened","possess"].find(s => e.name.toLowerCase().includes(s))||e.changes?.find(c=>["charmed","frightened","possess"].find(s=>c.value.toLowerCase().includes(s))))||workflow?.targets&&canvas.tokens.get(targetId).actor?.effects?.find(e=>e.name==workflow?.item?.name&&e.changes?.find(c=>["charmed","frightened","possess"].find(s=>c.value.toLowerCase().includes(s))))

