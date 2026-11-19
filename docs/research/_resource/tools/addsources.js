// Add the PROVENANCE entries for the sources the re-sourcing readers (rs1-rs9) cite. Lane 1.11r3.
const fs = require('fs');
const root = (process.env.PACK_ROOT || '.').replace(/\\/g, '/').replace(/\/?$/, '/'); // a worktree holding packs/ and docs/research/_resource/
const pf = root + 'packs/union-1861/PROVENANCE.json';
const p = JSON.parse(fs.readFileSync(pf, 'utf8'));
const have = new Set(p.sources.map((s) => s.key));
const E = 'expired-copyright', G = 'government-work';
// [key, title, kind, basis, copyUsed]
const T = [
  ['BOWLES-MERRIAM', 'G. S. Merriam, The Life and Times of Samuel Bowles, vol. 1 (New York: Century, 1885)', 'primary', E, 'archive.org lifetimesofsamue01merr; p. 318 prints Bowles to H. L. Dawes of 26 February 1861 (the letter is the leg, the biography only prints it)'],
  ['BLAIR-COOPER-1860', 'Speech of Hon. F. P. Blair, Jr., at the Cooper Institute, 25 January 1860 (New York: Buell and Blanchard, 1860)', 'primary', E, 'archive.org ASPC0001904700; with Hiram Barney\'s introduction from the N.Y. Herald of 26 January'],
  ['BLAIR-COLONIZATION-1859', 'F. P. Blair, Jr., Colonization and Commerce: address at Cincinnati, 29 November 1859', 'primary', E, 'archive.org colonizationcomm00blai; unpaginated in the OCR'],
  ['PA-TELEGRAPH-1860', 'Pennsylvania Daily Telegraph (Harrisburg), 6 October 1860, edition 1', 'primary', E, 'archive.org per_pennsylvania-daily-telegraph_pennsylvania-daily-telegraph_1860-10-06_1; quotes the Philadelphia Evening Journal of 28 February 1860; OCR garbled, page not shown'],
  ['CONG-GLOBE-37-1', 'Congressional Globe, 37th Congress, extra session, issue 2 (printed 10 July 1861; sittings of 5, 8 and 9 July)', 'primary', G, 'archive.org sim_united-states-congress-congressional-globe_1861-07-10_2; page numbers not read from the OCR'],
  ['GLOBE-36-2', 'Congressional Globe, 36th Congress, 2nd session, daily issues (December 1860 to March 1861)', 'primary', G, 'archive.org sim_united-states-congress-congressional-globe_<date>_<n>; read at the issue of the day after the sitting; page numbers from the OCR running heads, whose columns are interleaved'],
  ['NYT-1860-12-20', 'The New York Times, 20 December 1860', 'primary', E, 'archive.org sim_new-york-times_the-new-york-times_1860-12-20_10_2886; OCR columns scrambled, page not read'],
  ['NYT-1861-01-12', 'The New York Times, 12 January 1861', 'primary', E, 'archive.org sim_new-york-times_the-new-york-times_1861-01-12_10_2905; OCR columns scrambled, page not read'],
  ['NYT-1861-01-30', 'The New York Times, 30 January 1861', 'primary', E, 'archive.org sim_new-york-times_the-new-york-times_1861-01-30_10_2920; OCR columns scrambled, page not read'],
  ['NYT-1861-02-05', 'The New York Times, 5 February 1861', 'primary', E, 'archive.org sim_new-york-times_the-new-york-times_1861-02-05_10_2925; OCR columns scrambled, page not read'],
  ['NYT-1861-02-19', 'The New York Times, 19 February 1861', 'primary', E, 'archive.org sim_new-york-times (issue of 19 February 1861); OCR columns scrambled, page not read'],
  ['NYT-1861-03-02', 'The New York Times, 2 March 1861', 'primary', E, 'archive.org sim_new-york-times (issue of 2 March 1861); OCR columns scrambled, page not read'],
  ['QV-LETTERS', 'The Letters of Queen Victoria, vol. 3 (London: Murray, 1907)', 'primary', E, 'archive.org lettersofqueenvi03victuoft; p. 383 prints Russell\'s letter to the Queen of 11 January 1860 (the letter is the leg)'],
  ['CURTIS-BUCHANAN', 'G. T. Curtis, Life of James Buchanan, vol. 2 (New York: Harper, 1883)', 'primary', E, 'archive.org lifeofjamesbucha02incurt; pp. 534-535 and 559 print Stanton\'s private letters of 16 March and 26 July 1861 (the letters are the leg)'],
  ['FREMONT-DEFENCE-1848', 'Defence of Lieut. Col. J. C. Fremont before the military court martial, Washington, January 1848', 'primary', E, 'archive.org defenceoflieutco00frrich; pp. 13-14 print Kearny\'s testimony and Fremont\'s reply'],
  ['BIGELOW-FREMONT-1856', 'J. Bigelow, Memoir of the Life and Public Services of John Charles Fremont (1856)', 'primary', E, 'archive.org memoiroflifepubl5830bige; a campaign Life: used only for the letter of acceptance of 8 July 1856 (pp. 458-459) and the informal ballot of 17 June 1856 (p. 451), which it prints'],
  ['CHITTENDEN-1864', 'L. E. Chittenden, Report of the Debates and Proceedings in the Secret Sessions of the Conference Convention (New York, 1864)', 'primary', E, 'archive.org reportofdebatesa00chitrich; compiled from the secretary\'s notes and treated as near-contemporary: the New York delegation minutes (Appendix p. 600) and Chase (p. 272)'],
  ['BROWNING-D', 'The Diary of Orville Hickman Browning, vol. 1, 1850-1864, ed. T. C. Pease and J. G. Randall (Springfield: Illinois State Historical Library, 1925)', 'primary', E, 'archive.org diaryoforvillehi0001theo; a diary of the time (entries of 9 and 11 February and 26 April 1861 used)'],
  ['BATES-D', 'The Diary of Edward Bates, 1859-1866, ed. H. K. Beale (Annual Report of the American Historical Association for 1930, vol. 4; GPO, 1933)', 'primary', G, 'archive.org diaryofedwardbat00bate; a diary of the time. The licence caveat of lane 1.11a stands (no licence is stated on the printing): nothing but the Dana antislavery cell rests on Bates alone'],
  ['MO-CONV-JUL1861', 'Journal of the Missouri State Convention, held at Jefferson City, July 1861', 'primary', G, 'archive.org journalofmissour00miss; Gamble\'s election (p. 25), his address (pp. 27-28) and oath (p. 32)'],
  ['HOPPIN-FOOTE', 'J. M. Hoppin, Life of Admiral Foote (New York: Appleton, 1874)', 'primary', E, 'archive.org lifeofandrewhull00hopprich; p. 147 prints Du Pont\'s letter of 25 January 1861 (the letter is the leg, the Life a friendly biography)'],
  ['CLAY-WRITINGS', 'C. M. Clay, The Writings of Cassius Marcellus Clay, including speeches and addresses (New York: Harper, 1848)', 'primary', E, 'archive.org writingsofcassiu00clay; his own speeches and True American editorials, each dated in the original (pp. 134, 213-215)'],
  ['SEYMOUR-SPEECHES', 'Speeches of Hon. Horatio Seymour at the conventions held at Albany, January 31, 1861 and September 10, 1862 (1862)', 'primary', E, 'archive.org speechhoratio00seymrich; only the 31 January 1861 speech is used (the 1862 speech is after every boundary)'],
  ['SEYMOUR-RECORD', 'Public Record: including speeches, messages, proclamations ... and other public utterances of Horatio Seymour (New York, 1868)', 'primary', E, 'archive.org cu31924032762290; prints each speech in full; used for the 4 July 1856 Springfield speech (pp. 18-20, 9-10)'],
  ['JONES-TATTNALL', 'C. C. Jones, Jr., The Life and Services of Commodore Josiah Tattnall (Savannah, 1878)', 'primary', E, 'archive.org josiahtattnall00jonerich; a life, used only for the official letters it prints verbatim (Lord Lyons to Cass, October 1859; Toucey to Tattnall, 22 October 1859; Tattnall\'s reply; pp. 106-109)'],
  ['GREELEY-HINTS', 'H. Greeley, Hints toward Reforms, in Lectures, Addresses, and Other Writings (New York, 1850; 1854 printing)', 'primary', E, 'archive.org hintstowardrefor00greeuoft; pp. 352-357 print his letter "Slavery at Home" of 3 June 1845'],
  ['RUSSELL-DIARY', 'W. H. Russell, My Diary North and South (Boston: Burnham, 1863)', 'primary', E, 'archive.org mydiarynorthsout00russe; written from his Times letters of 1861; the entry date for the Sanford dinner is not printed in the OCR (he reached Washington on 27 March 1861), so it is dated 1861-03'],
  ['SEWARD-WASH', 'F. W. Seward, Seward at Washington as Senator and Secretary of State, vol. 1 (New York, 1891)', 'primary', E, 'archive.org sewardatwashingt01sewa; used only for the letters it prints verbatim (Seward to Weed 13 December 1860; to Lincoln 16 December 1860 and 8 January 1861; Lincoln to Seward 3 January 1861); the son\'s narrative is not a leg'],
  ['FARRAGUT-LIFE', 'Loyall Farragut, The Life of David Glasgow Farragut (New York: Appleton, 1879)', 'primary', E, 'archive.org lifeofdavidglasg01farr; pp. 172-173 print Farragut\'s letters to Secretary Dobbin'],
  ['USNI-1935', '"The First Academic Staff", U.S. Naval Institute Proceedings 61 (October 1935)', 'primary', E, 'read on the penelope.uchicago.edu mirror (no page number there); it quotes a fragment of Bancroft\'s annual report for 1845, which was not itself reached: a thin leg'],
  ['IL-AGR1', 'Report of the Adjutant General of the State of Illinois, vol. 1 (Springfield, 1867)', 'primary', G, 'archive.org reportofadjutant01illi1 (University of Illinois OCR mirror); p. 7 by its own table of contents'],
  ['YATES-1860', 'Speech of Hon. Richard Yates at the Springfield Jubilee, 20 November 1860 (pamphlet)', 'primary', E, 'archive.org speechofhonricha00yate; no page numbers in the OCR'],
  ['MANSFIELD-1848', 'The Mexican War: a history of its origin ... with the official dispatches of the generals (1848)', 'primary', E, 'archive.org mexicanwarhistor01mans; General Scott\'s despatch of 19 April 1847 (Cerro Gordo), pp. 198-199'],
  ['YANCEY-1860', 'Speech of the Hon. William L. Yancey, Charleston, 28 April 1860', 'primary', E, 'archive.org speechofhonwilli00yanc; pp. 14-15; OCR garbled in the quoted lines'],
  ['ArmyReg1861-09', 'Official Army Register for September 1861 (Adjutant General\'s Office, 1 September 1861)', 'primary', G, 'archive.org officialarmyregi1861unit; casualties (resignations and dismissals with dates) pp. 61-66; not the 1 January 1861 register (officialarmyreg01offigoog timed out)'],
  ['NavyReg1863-RESIGN', 'Register of the Commissioned and Warrant Officers of the Navy, 1863 edition: the tables of resignations and dismissals, 1 January 1861 to 31 December 1862', 'primary', G, 'archive.org registerofcommi00unit (a composite volume, 1861-1863); Buchanan is in Dismissals p. 112, not Resignations; other entries retain their own table locators'],
  ['ANDREW-1861-01-05', 'Address of His Excellency John A. Andrew to the two branches of the Legislature of Massachusetts, 5 January 1861 (Senate No. 2)', 'primary', G, 'archive.org wsb19f30_images'],
  ['JOHNSON-1861-02-05', 'Speech of Hon. Andrew Johnson, 5 February 1861 (pamphlet)', 'primary', E, 'archive.org speechofhonandre00john'],
  ['DEM-1860', 'Official Proceedings of the Democratic National Convention, Charleston and Baltimore, 1860', 'primary', E, 'archive.org officialproceedidemo'],
  ['NH-CW2', 'J. G. Nicolay and J. Hay, eds., Complete Works of Abraham Lincoln, vol. 2 (1894)', 'primary', E, 'archive.org completeworksofa02linc_0; p. 6, First Inaugural Address'],
  ['MCCLERNAND-1861-01-14', 'Speech of Hon. John A. McClernand, 14 January 1861 (pamphlet)', 'primary', E, 'archive.org speechofhonjohna00mccl'],
  ['SEWARD-1861-01-12', 'Speech of William H. Seward on the Union, 12 January 1861 (pamphlet)', 'primary', E, 'archive.org unionspeechofw00sewa'],
  ['STEVENS-1861-01-29', 'Speech of Thaddeus Stevens on the state of the Union, 29 January 1861 (pamphlet)', 'primary', E, 'archive.org stateofunionspee00stev; no page markers in the OCR'],
  ['VALLANDIGHAM-1861-02-20', 'Speech of Hon. C. L. Vallandigham, 20 February 1861 (pamphlet)', 'primary', E, 'archive.org speechofhonclval00vall'],
  ['WADE-1860-12-17', 'Speech of Hon. B. F. Wade, 17 December 1860 (pamphlet)', 'primary', E, 'archive.org speechofhonbfwad01lcwade'],
];
let added = 0;
for (const [key, title, kind, basis, copyUsed] of T) {
  if (have.has(key)) continue;
  p.sources.push({ key, title, kind, licence: 'public-domain', basis, copyUsed: copyUsed + ' (lane 1.11r3)', licencePage: null, licenceReadOn: null });
  added++;
}
fs.writeFileSync(pf, JSON.stringify(p, null, 2));
console.log('added', added);
