### TST Number Navigation

⚠ This addon extends and works only with <a href="https://addons.mozilla.org/en-US/firefox/addon/tree-style-tab/">Tree Style Tab</a>.

Use your number keys to zip around within your tree of tabs, and other things. The following shortcuts are the only functionality that is provided. You must configure the shortcuts yourself through about:addons then clicking the gear icon.

The shortcuts "select-sibling-number-1" through "select-sibling-number-20" allow you to focus (go to) the Nth sibling tab of the currently active tab.

The shortcut "focus-parent-set-downstream" lets you focus your parent tab, and remember where you came from so that "focus-downstream" can take you there quickly in the future.

The shortcut "focus-root-set-downstream" will take you all the way to the top of the tree, and you can "focus-downstream" repeatedly to get back where you were.

Finally, "indent-tree" and "outdent-tree-safe" can take your sub-tree higher or lower in the hierarchy. The difference between these commands and the equivalent commands in "TST More Tree Commands" is that the outdent command will not leave you with two sibling trees non-collapsed at the same time.

### Purple Counters:)

When using this addon, you will have to jump to each tab based on how it is numbered among its siblings. So, you might appreciate a small indicator showing that number.

You can add this CSS to Tree Style Tab options > Advanced, and each tab will get its own purple indicator. You don't have to make them purple, you just really should!!

This is just an example to help you along, so don't do it exactly the same as me. A lot of this CSS comes straight from piroor's docs.

```
/* Delete the close button to make room for counter */
tab-item tab-closebox {
	display: none;
}

/* Move the mute/unmute button, text box, and indicator for no. of collapsed tabs, over to make room for the counter */
tab-counter, tab-label, tab-sound-button {
  margin-right: 12px;
}

/* Stuff to make extra items work */
tab-item .extra-items-container.behind {
  z-index: unset !important;
}

/* Extra item style, very pretty in purple */
tab-item .extra-items-container.behind::after {
  margin-right: 0px;
  background: purple;
  color: white;
  font-size: x-small;
  font-family: monospace;
  right: 0.2em;
  padding: 0.2em;
  pointer-events: none;
  position: absolute;
  bottom: 0.2em;
  z-index: 1000;
}

/* Counter calculation */
#tabbar {
  counter-reset: c0 c1 c2 c3 c4 c5 c6 c7;
}
tab-item:not(.collapsed)[data-level="0"] .extra-items-container.behind::after {
  counter-increment: c0;
  counter-set: c1;
  content: counter(c0);
}
tab-item:not(.collapsed)[data-level="1"] .extra-items-container.behind::after {
  counter-increment: c1;
  counter-set: c2;
  content: counter(c1);
}
tab-item:not(.collapsed)[data-level="2"] .extra-items-container.behind::after {
  counter-increment: c2;
  counter-set: c3;
  content: counter(c2);
}
tab-item:not(.collapsed)[data-level="3"] .extra-items-container.behind::after {
  counter-increment: c3;
  counter-set: c4;
  content: counter(c3);
}
tab-item:not(.collapsed)[data-level="4"] .extra-items-container.behind::after {
  counter-increment: c4;
  counter-set: c5;
  content: counter(c4);
}
tab-item:not(.collapsed)[data-level="5"] .extra-items-container.behind::after {
  counter-increment: c5;
  counter-set: c6;
  content: counter(c5);
}
tab-item:not(.collapsed)[data-level="6"] .extra-items-container.behind::after {
  counter-increment: c6;
  counter-set: c7;
  content: counter(c6);
}
tab-item:not(.collapsed)[data-level="7"] .extra-items-container.behind::after {
  counter-increment: c7;
  content: counter(c7);
}
```
