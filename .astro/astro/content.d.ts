declare module 'astro:content' {
	interface Render {
		'.mdx': Promise<{
			Content: import('astro').MarkdownInstance<{}>['Content'];
			headings: import('astro').MarkdownHeading[];
			remarkPluginFrontmatter: Record<string, any>;
		}>;
	}
}

declare module 'astro:content' {
	interface RenderResult {
		Content: import('astro/runtime/server/index.js').AstroComponentFactory;
		headings: import('astro').MarkdownHeading[];
		remarkPluginFrontmatter: Record<string, any>;
	}
	interface Render {
		'.md': Promise<RenderResult>;
	}

	export interface RenderedContent {
		html: string;
		metadata?: {
			imagePaths: Array<string>;
			[key: string]: unknown;
		};
	}
}

declare module 'astro:content' {
	type Flatten<T> = T extends { [K: string]: infer U } ? U : never;

	export type CollectionKey = keyof AnyEntryMap;
	export type CollectionEntry<C extends CollectionKey> = Flatten<AnyEntryMap[C]>;

	export type ContentCollectionKey = keyof ContentEntryMap;
	export type DataCollectionKey = keyof DataEntryMap;

	type AllValuesOf<T> = T extends any ? T[keyof T] : never;
	type ValidContentEntrySlug<C extends keyof ContentEntryMap> = AllValuesOf<
		ContentEntryMap[C]
	>['slug'];

	/** @deprecated Use `getEntry` instead. */
	export function getEntryBySlug<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		// Note that this has to accept a regular string too, for SSR
		entrySlug: E,
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;

	/** @deprecated Use `getEntry` instead. */
	export function getDataEntryById<C extends keyof DataEntryMap, E extends keyof DataEntryMap[C]>(
		collection: C,
		entryId: E,
	): Promise<CollectionEntry<C>>;

	export function getCollection<C extends keyof AnyEntryMap, E extends CollectionEntry<C>>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => entry is E,
	): Promise<E[]>;
	export function getCollection<C extends keyof AnyEntryMap>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => unknown,
	): Promise<CollectionEntry<C>[]>;

	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(entry: {
		collection: C;
		slug: E;
	}): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(entry: {
		collection: C;
		id: E;
	}): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		slug: E,
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(
		collection: C,
		id: E,
	): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;

	/** Resolve an array of entry references from the same collection */
	export function getEntries<C extends keyof ContentEntryMap>(
		entries: {
			collection: C;
			slug: ValidContentEntrySlug<C>;
		}[],
	): Promise<CollectionEntry<C>[]>;
	export function getEntries<C extends keyof DataEntryMap>(
		entries: {
			collection: C;
			id: keyof DataEntryMap[C];
		}[],
	): Promise<CollectionEntry<C>[]>;

	export function render<C extends keyof AnyEntryMap>(
		entry: AnyEntryMap[C][string],
	): Promise<RenderResult>;

	export function reference<C extends keyof AnyEntryMap>(
		collection: C,
	): import('astro/zod').ZodEffects<
		import('astro/zod').ZodString,
		C extends keyof ContentEntryMap
			? {
					collection: C;
					slug: ValidContentEntrySlug<C>;
				}
			: {
					collection: C;
					id: keyof DataEntryMap[C];
				}
	>;
	// Allow generic `string` to avoid excessive type errors in the config
	// if `dev` is not running to update as you edit.
	// Invalid collection names will be caught at build time.
	export function reference<C extends string>(
		collection: C,
	): import('astro/zod').ZodEffects<import('astro/zod').ZodString, never>;

	type ReturnTypeOrOriginal<T> = T extends (...args: any[]) => infer R ? R : T;
	type InferEntrySchema<C extends keyof AnyEntryMap> = import('astro/zod').infer<
		ReturnTypeOrOriginal<Required<ContentConfig['collections'][C]>['schema']>
	>;

	type ContentEntryMap = {
		"drafts": Record<string, {
  id: string;
  slug: string;
  body: string;
  collection: "drafts";
  data: any;
  render(): Render[".md"];
}>;
"posts": {
"agd-for-airbnb.md": {
	id: "agd-for-airbnb.md";
  slug: "agd-for-airbnb";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"agd-for-offices.md": {
	id: "agd-for-offices.md";
  slug: "agd-for-offices";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"auto-szrot.md": {
	id: "auto-szrot.md";
  slug: "auto-szrot";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"banner-to-rent.md": {
	id: "banner-to-rent.md";
  slug: "banner-to-rent";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"bookmarks-chatbot.md": {
	id: "bookmarks-chatbot.md";
  slug: "bookmarks-chatbot";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"builtin-hydroponic-garden-system.md": {
	id: "builtin-hydroponic-garden-system.md";
  slug: "builtin-hydroponic-garden-system";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"business-cards-app.md": {
	id: "business-cards-app.md";
  slug: "business-cards-app";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"cemetery-map.md": {
	id: "cemetery-map.md";
  slug: "cemetery-map";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"clean-my-forest.md": {
	id: "clean-my-forest.md";
  slug: "clean-my-forest";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"cnc-machines-map.md": {
	id: "cnc-machines-map.md";
  slug: "cnc-machines-map";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"custom-sticker-labels-printing.md": {
	id: "custom-sticker-labels-printing.md";
  slug: "custom-sticker-labels-printing";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"customizable-marketplace.md": {
	id: "customizable-marketplace.md";
  slug: "customizable-marketplace";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"customizable.com.md": {
	id: "customizable.com.md";
  slug: "customizablecom";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"europen-zombie-story.md": {
	id: "europen-zombie-story.md";
  slug: "europen-zombie-story";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"events-calendar-certs.md": {
	id: "events-calendar-certs.md";
  slug: "events-calendar-certs";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"franczyza-mechaniczna.md": {
	id: "franczyza-mechaniczna.md";
  slug: "franczyza-mechaniczna";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"free-volunteer-service-platform.md": {
	id: "free-volunteer-service-platform.md";
  slug: "free-volunteer-service-platform";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"future-file-explorer.md": {
	id: "future-file-explorer.md";
  slug: "future-file-explorer";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"gift-ideas-app.md": {
	id: "gift-ideas-app.md";
  slug: "gift-ideas-app";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"gifts-ideas-app.md": {
	id: "gifts-ideas-app.md";
  slug: "gifts-ideas-app";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"integracja-ue.md": {
	id: "integracja-ue.md";
  slug: "integracja-ue";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"iot-rfid-button.md": {
	id: "iot-rfid-button.md";
  slug: "iot-rfid-button";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"iot-smarthome-products.md": {
	id: "iot-smarthome-products.md";
  slug: "iot-smarthome-products";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"mechanical-franchise.md": {
	id: "mechanical-franchise.md";
  slug: "mechanical-franchise";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"meme-sort-app.md": {
	id: "meme-sort-app.md";
  slug: "meme-sort-app";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"nanoplatnosci.md": {
	id: "nanoplatnosci.md";
  slug: "nanoplatnosci";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"nas-software.md": {
	id: "nas-software.md";
  slug: "nas-software";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"nas.md": {
	id: "nas.md";
  slug: "nas";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"polish-innovation-ranking.md": {
	id: "polish-innovation-ranking.md";
  slug: "polish-innovation-ranking";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"remote-rental.md": {
	id: "remote-rental.md";
  slug: "remote-rental";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"remote-villages.md": {
	id: "remote-villages.md";
  slug: "remote-villages";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"remote-villas.md": {
	id: "remote-villas.md";
  slug: "remote-villas";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"remote-worker-rentals.md": {
	id: "remote-worker-rentals.md";
  slug: "remote-worker-rentals";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"robotic-management-system.md": {
	id: "robotic-management-system.md";
  slug: "robotic-management-system";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"robotics-company.md": {
	id: "robotics-company.md";
  slug: "robotics-company";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"robotyka.md": {
	id: "robotyka.md";
  slug: "robotyka";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"scrum-my-life.md": {
	id: "scrum-my-life.md";
  slug: "scrum-my-life";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"sending-gits-abroad.md": {
	id: "sending-gits-abroad.md";
  slug: "sending-gits-abroad";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"showroom-iot.md": {
	id: "showroom-iot.md";
  slug: "showroom-iot";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"smart-height-adjustabe-desk.md": {
	id: "smart-height-adjustabe-desk.md";
  slug: "smart-height-adjustabe-desk";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"sodkowa-europa-informatycy.md": {
	id: "sodkowa-europa-informatycy.md";
  slug: "sodkowa-europa-informatycy";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"spots-for-charging-ehulajnoga.md": {
	id: "spots-for-charging-ehulajnoga.md";
  slug: "spots-for-charging-ehulajnoga";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"time-machine-app.md": {
	id: "time-machine-app.md";
  slug: "time-machine-app";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"tracking-urban-vandalism.md": {
	id: "tracking-urban-vandalism.md";
  slug: "tracking-urban-vandalism";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"youtube.md": {
	id: "youtube.md";
  slug: "youtube";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
"yt.zentala.eu.md": {
	id: "yt.zentala.eu.md";
  slug: "ytzentalaeu";
  body: string;
  collection: "posts";
  data: any
} & { render(): Render[".md"] };
};

	};

	type DataEntryMap = {
		
	};

	type AnyEntryMap = ContentEntryMap & DataEntryMap;

	export type ContentConfig = never;
}
