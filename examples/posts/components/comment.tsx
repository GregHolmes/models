'use client';

import { useContext, useState, FormEvent } from 'react';
import Image from 'next/image';
import type { Prisma } from '@prisma/client';
import { TrashIcon, PencilIcon } from '@heroicons/react/24/solid';
import { getPost } from '@/lib/prisma/api';
import { DEFAULT_AVATAR_URL } from '@/lib/image';
import { UserContext } from '@/context/user';
import type { CommentWithAuthor } from '@/lib/prisma/api';

type postWithComments = Prisma.PromiseReturnType<typeof getPost>;

type CommentProps = {
	comment: postWithComments['comments'][number],
	onEdit: (content: string) => void,
	onDelete:  () => void,
};

export default function Comment({ comment, onEdit, onDelete }: CommentProps) {
	const user = useContext(UserContext);
	const [isEditMode, setIsEditMode] = useState(false);
	const [editedComment, setEditedComment] = useState(comment.content);

	async function editComment(e: FormEvent) {
		e.preventDefault();
		setIsEditMode(false);

		const response = await fetch(`/api/comments/${comment.id}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				content: editedComment,
			}),
		});
	
		if (!response.ok) {
			throw new Error(`PUT /api/comments/:id: ${response.status} ${JSON.stringify(await response.json())}`);
		}

		const data = await response.json() as ({ data: CommentWithAuthor });
		onEdit(editedComment);
	}

	async function deleteComment(e: FormEvent) {
		e.preventDefault();

		const response = await fetch(`/api/comments/${comment.id}`, { method: 'DELETE' });

		if (!response.ok) {
			throw new Error(`DELETE /api/comments/:id: ${response.status} ${JSON.stringify(await response.json())}`);
		}

		const data = await response.json();
		onDelete();
	}

	return (
		<div className="bg-white/30 px-4 pb-4 mb-2 shadow-xl ring-1 ring-gray-900/5 rounded-lg backdrop-blur-lg max-w-xl mx-auto w-full">
			<div className="flex flex-col">
				<div className="flex items-center py-3">
					<div className="flex flex-col space-x-4 pr-3">
						<Image
							src={comment.author.image || DEFAULT_AVATAR_URL}
							alt={comment.author.username}
							width={36}
							height={36}
							className="rounded-full ring-1 ring-gray-900/5"
						/>
					</div>
					<p className="text-sm font-semibold">{comment.author.username}</p>
					<p className="ml-auto text-sm text-gray-500">TODO date</p>
					{comment.authorId === user?.id && <>
						<PencilIcon className="ml-4 h-6 w-6 text-blue-300 hover:text-blue-500 hover:cursor-pointer" onClick={() => setIsEditMode(!isEditMode)} />
						<TrashIcon className="ml-4 h-6 w-6 text-red-300 hover:text-red-500 hover:cursor-pointer" onClick={deleteComment} />
					</>}
				</div>
				{isEditMode ? <form className="space-y-1" onSubmit={editComment} onReset={e => {
					e.preventDefault();
					setIsEditMode(false);
					setEditedComment(comment.content);
				}}>
					<textarea
						className="w-full px-0 text-sm text-gray-900 bg-white outline-none rounded-lg ring-0 border border-gray-300 focus:border-gray-500"
						value={editedComment}
						onChange={e => setEditedComment(e.target.value)}
					></textarea>
					<button type="reset" className="inline-flex items-center py-2.5 px-4 mr-2 text-xs font-normal text-center text-gray-500 border rounded-lg focus:bg-gray-200 hover:text-gray-700">
						Cancel
					</button>
					<button type="submit" className="inline-flex items-center py-2.5 px-4 text-xs font-medium text-center text-white bg-blue-700 rounded-lg focus:bg-blue-900 hover:bg-blue-800">
						Save
					</button>
				</form> : <div className="space-y-1">
					<p className="font-normal leading-none">{comment.content}</p>
				</div>}
			</div>
		</div>
	)
}
