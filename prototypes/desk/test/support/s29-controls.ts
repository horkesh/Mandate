import {expect,type Page} from '@playwright/test';
import {S} from '../../web/strings.ts';
/** Follow the dialog's own Back/Put down control at every depth. */
export async function rest(page:Page){
 for(let i=0;i<8;i++){
  const close=page.locator('dialog[open] > .panel-header > button.close');
  if(await close.isVisible()){await close.click();continue;}
  const review=page.getByRole('button',{name:S.closeReview,exact:true});
  if(await review.isVisible()){await review.click();continue;}
  const paper=page.getByRole('button',{name:S.returnPaper,exact:true});
  if(await paper.isVisible()){await paper.click();continue;}
  await expect(page.getByTestId('desk')).not.toHaveAttribute('inert','');return;
 }
 throw Error('The desk did not return after eight closing controls');
}
