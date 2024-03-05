try {
	if (args[0] == "off" && args[args.length - 1].efData.disabled) await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: args[args.length - 1].actorUuid, effects: [args[args.length - 1].efData._id] });
} catch (err)  {console.error("Remove Effect Disabled Macro - ", err)}