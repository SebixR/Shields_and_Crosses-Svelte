<script lang="ts">
	import * as Drawer from '$lib/components/ui/drawer/index.js';
	import { ChevronLeftIcon } from '@lucide/svelte';
	import { buttonVariants } from './ui/button';
	import { Separator } from './ui/separator';
</script>

<Drawer.Root>
	<Drawer.Trigger type="button" class="{buttonVariants({})} fixed bottom-5 left-10 rotate-90">
		<ChevronLeftIcon /> Rules
	</Drawer.Trigger>
	<Drawer.Content>
		<div class="thin mx-auto w-150 overflow-auto pe-4" style="scrollbar-width: thin">
			<article class="mt-6 flex flex-col gap-2">
				<h2 class="font-bold text-white">Shields & Crosses: Game Rules</h2>

				<section>
					<p>Each class has one associated primary statistic:</p>
					<ul>
						<li><strong>Warrior</strong> - Strength</li>
						<li><strong>Rogue</strong> - Speed</li>
						<li><strong>Mage</strong> - Intelligence</li>
					</ul>
				</section>

				<section>
					<p>
						Characters play a game of Tic-Tac-Toe where each column is assigned one of the three
						statistics (these assignments change every match).
					</p>
					<p>
						<em
							><strong>Special Rule:</strong> Once per game, if a character is winning via their associated
							statistic but losing in the others, they may overwrite one of the opponent's symbols - but
							only to prevent the opponent from winning.</em
						>
					</p>
				</section>

				<Separator class="my-2" />

				<section class="flex flex-col gap-2">
					<p>At the end of the game, points are calculated as follows:</p>

					<ol class="flex flex-col gap-2">
						<li>
							<strong>Board Points:</strong> Each statistic is increased by the number of fields
							occupied on the board (calculated per row and column). <br />
							<em
								>Note: Stats present in [Stat x Stat] fields (ex. [str x str]) increase the
								character's primary statistic by 3, instead of 2 points.</em
							>
						</li>

						<li>
							<strong>Bonus Points (Applied in strict order):</strong>
							<ul class="space-y-2">
								<li>
									<strong>Double Advantage:</strong> If a character has double the points in their
									primary stat (or the opponent has 0), they receive +2 to a drawing stat or the
									losing stat with the smallest deficit.
									<p>
										<small
											>*If both characters meet this criteria, the board winner is processed first.
											If the board was a draw, the character with the higher current primary stat
											goes first. If still tied, the order is random.</small
										>
									</p>
								</li>
								<li>
									<strong>General Win:</strong> The overall winner receives +2 to a drawing stat or the
									losing stat with the smallest deficit.
								</li>
								<li>
									<strong>Stat Synergy:</strong> Winning via a row or column matching your primary stat
									grants +1 to a drawing stat or the losing stat with the smallest deficit.
								</li>
							</ul>
						</li>

						<Separator class="my-2" />

						<li>
							<strong>Victory Condition:</strong> The character who wins in at least two out of the three
							statistics is declared the winner.
						</li>

						<li>
							<strong>Draws:</strong> There are no additional tie-breaking methods.
						</li>
					</ol>
				</section>
			</article>
			<Drawer.Footer class="mb-4"></Drawer.Footer>
		</div>
	</Drawer.Content>
</Drawer.Root>
