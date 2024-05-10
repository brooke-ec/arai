/**
* This file was @generated using pocketbase-typegen
*/

import type PocketBase from 'pocketbase'
import type { RecordService } from 'pocketbase'

export enum Collections {
	Member = "member",
	Suggestion = "suggestion",
	User = "user",
}

// Alias types for improved usability
export type IsoDateString = string
export type RecordIdString = string
export type HTMLString = string

// System fields
export type BaseSystemFields<T = never> = {
	id: RecordIdString
	created: IsoDateString
	updated: IsoDateString
	collectionId: string
	collectionName: Collections
	expand?: T
}

export type AuthSystemFields<T = never> = {
	email: string
	emailVisibility: boolean
	username: string
	verified: boolean
} & BaseSystemFields<T>

// Record types for each collection

export type MemberRecord = {
	avatar: string
	name: string
	snowflake?: string
}

export type SuggestionRecord = {
	author?: RecordIdString
	content?: string
	message: string
}

export type UserRecord = {
	snowflake?: string
}

// Response types include system fields and match responses from the PocketBase API
export type MemberResponse<Texpand = unknown> = Required<MemberRecord> & BaseSystemFields<Texpand>
export type SuggestionResponse<Texpand = unknown> = Required<SuggestionRecord> & BaseSystemFields<Texpand>
export type UserResponse<Texpand = unknown> = Required<UserRecord> & AuthSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	member: MemberRecord
	suggestion: SuggestionRecord
	user: UserRecord
}

export type CollectionResponses = {
	member: MemberResponse
	suggestion: SuggestionResponse
	user: UserResponse
}

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = PocketBase & {
	collection(idOrName: 'member'): RecordService<MemberResponse>
	collection(idOrName: 'suggestion'): RecordService<SuggestionResponse>
	collection(idOrName: 'user'): RecordService<UserResponse>
}
