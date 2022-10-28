### TST Number Navigation
is a Firefox addon. Here is the description I gave on its <a href="https://addons.mozilla.org/en-US/firefox/addon/tree-style-tab/">Product page</a>:

⚠ This addon extends and works only with <a href="https://addons.mozilla.org/en-US/firefox/addon/tree-style-tab/">Tree Style Tab</a>.

Use your number keys to zip around within your tree of tabs, and other things.

The shortcuts "select-sibling-number-1" through "select-sibling-number-9" allow you to focus the Nth sibling tab of the currently active tab.

The shortcuts "focus-parent-set-downstream" lets you focus your parent tab, and remember where you came from so that "focus-downstream" can take you there quickly in the future.

The shortcut "focus-root-set-downstream" will take you all the way to the top of the tree, and you can "focus-downstream" repeatedly to get back where you were.

There are some others that are already available as TST shortcuts, but I have re-implemented them. I explain why below.

In addition to creating shortcuts, you can also use TST Number Navigation by integrating with the add-on <a href="https://addons.mozilla.org/en-US/firefox/addon/vimium-c/">Vimium C</a>. This allows you to execute commands without reaching for a modifier key, and it allows you to get around some pages that will intercept your keystrokes and block your precious shortcuts from registering.

To set this up, add mappings to your Vimium C settings that send messages to TST Number Navigation. For example:

<b>Start of example Vimium C mappings</b></br>
unmap t
unmap T

map w sendToExtension data="close-tree" id="tst-num-nav@example.com"
map W sendToExtension data="close-children" id="tst-num-nav@example.com"
map e sendToExtension data="focus-downstream" id="tst-num-nav@example.com"
map u sendToExtension data="focus-parent-set-downstream" id="tst-num-nav@example.com"
map E sendToExtension data="focus-next-sibling" id="tst-num-nav@example.com"
map U sendToExtension data="focus-previous-sibling" id="tst-num-nav@example.com"
map t sendToExtension data="create-sibling-tab" id="tst-num-nav@example.com"
map T sendToExtension data="create-child-tab" id="tst-num-nav@example.com"
map q sendToExtension data="focus-root-set-downstream" id="tst-num-nav@example.com"

unmap 1
unmap 2
unmap 3
unmap 4
unmap 5
unmap 6
unmap 7
unmap 8
unmap 9

map 1 sendToExtension data="focus-sibling-number-1" id="tst-num-nav@example.com"
map 2 sendToExtension data="focus-sibling-number-2" id="tst-num-nav@example.com"
map 3 sendToExtension data="focus-sibling-number-3" id="tst-num-nav@example.com"
map 4 sendToExtension data="focus-sibling-number-4" id="tst-num-nav@example.com"
map 5 sendToExtension data="focus-sibling-number-5" id="tst-num-nav@example.com"
map 6 sendToExtension data="focus-sibling-number-6" id="tst-num-nav@example.com"
map 7 sendToExtension data="focus-sibling-number-7" id="tst-num-nav@example.com"
map 8 sendToExtension data="focus-sibling-number-8" id="tst-num-nav@example.com"
map 9 sendToExtension data="focus-sibling-number-9" id="tst-num-nav@example.com"
</br><b>End of example Vimium C mappings</b>

Vimium C is the reason why I have re-implemented some commands that were already available with TST alone. I wanted to use them through Vimium C.

While Vimium C mappings are very nice, you should still make keyboard shortcuts to use this add-on. The reason is that Vimium C doesn't work on some pages such as "about:about" or while you're inputting text into a form.

To create those shortcuts, go to the url about:addons > Click on the gear in the top left > Manage Extensions Shortcuts

<a href="https://github.com/csterlent/tst-num-nav">Github</a>

Here's the full list of shortcuts:

focus-parent-set-downstream</br>
focus-parent</br>
focus-downstream</br>
focus-first-child</br>
focus-sibling-number-1</br>
focus-sibling-number-2</br>
focus-sibling-number-3</br>
focus-sibling-number-4</br>
focus-sibling-number-5</br>
focus-sibling-number-6</br>
focus-sibling-number-7</br>
focus-sibling-number-8</br>
focus-sibling-number-9</br>
create-child-tab</br>
create-sibling-tab</br>
focus-next-sibling</br>
focus-previous-sibling</br>
close-tree</br>
close-children</br>
focus-root</br>
focus-root-set-downstream</br>
