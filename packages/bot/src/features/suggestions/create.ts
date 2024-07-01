import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { wrap } from "../../lib/utils";
import { button } from "jellycommands";

export default button({
	id: "suggestion-create",

	run: wrap(({ interaction }) =>
		interaction.showModal(
			new ModalBuilder()
				.setCustomId("suggestion-create")
				.setTitle("Create Suggestion")
				.addComponents(
					new ActionRowBuilder<TextInputBuilder>().addComponents(
						new TextInputBuilder()
							.setStyle(TextInputStyle.Paragraph)
							.setLabel("Enter your suggestion")
							.setCustomId("content")
							.setRequired(true)
							.setMaxLength(200),
					),
				),
		),
	),
});
