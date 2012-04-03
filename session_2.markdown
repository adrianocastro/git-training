# The Git sessions
## Session 2: Undoing things

### Unstaging files

    $ touch foobar
    $ git commit -am "Added foobar."

    $ echo 'hello foo' > foobar
    $ touch quux

    $ git add .

You’ve now staged both files but you actually only wanted to stage and commit `quux`. Running `git status` tells you just that and is kind enough to tell you how to unstage files:

    $ git status
    # On branch master
    # Changes to be committed:
    #   (use "git reset HEAD <file>..." to unstage)
    #
    #       modified:   foobar
    #       new file:   quux
    #

    $ git reset HEAD foobar

You’re basically telling Git to reset `foobar` to the last known commit (`HEAD` = the tip of the branch).

    $ git status
    # On branch master
    # Changes to be committed:
    #   (use "git reset HEAD <file>..." to unstage)
    #
    #       new file:   quux
    #
    # Changed but not updated:
    #   (use "git add <file>..." to update what will be committed)
    #   (use "git checkout -- <file>..." to discard changes in working directory)
    #
    #       modified:   foobar
    #

    $ git commit -m "Added quux."

### Changing the last commit

    $ git log --oneline -2
    0a62ca2 Added quux.
    e2a8b47 Added foobar.

    $ git commit --amend
    # Change message to "Added test file quux."

    $ git log --oneline -2
    ee9c944 Added test file quux.
    e2a8b47 Added foobar.

#### Using it to add missed files to a commit

Forgot to add foobar. Let’s fix that:

    $ git add foobar
    $ git commit --amend
    # Change message to "Added test file quux and made changes to foobar."

    $ git log --oneline -2
    648b0ad Added test file quux and made changes to foobar.
    e2a8b47 Added foobar.

    $ git show 648b0ad
    commit 648b0adf7486f0b8730665257c443b5bba512168
    Author: Adriano Castro <ad@adrianocastro.net>
    Date:   Tue Apr 3 02:55:36 2012 -0700

        Added test file quux and made changes to foobar.

    diff --git a/foobar b/foobar
    index e69de29..dfbb215 100644
    --- a/foobar
    +++ b/foobar
    @@ -0,0 +1 @@
    +hello foo
    diff --git a/quux b/quux
    new file mode 100644
    index 0000000..e69de29

### Unmodifying a modified file

Let’s make some changes to `foobar`:

    $ echo 'goodbye.' >> foobar

**Oops!** I regret doing that. Luckily Git tells me how I can easily discard these changes:

    $ git status
    # On branch master
    # Changed but not updated:
    #   (use "git add <file>..." to update what will be committed)
    #   (use "git checkout -- <file>..." to discard changes in working directory)
    #
    #       modified:   foobar
    #
    no changes added to commit (use "git add" and/or "git commit -a")

    $ git checkout -- foobar

You’re telling Git to check out the latest committed version of `foobar`. The double dashes simply mean you’re done passing parameters to the command and what follows is a file.

    $ git status
    # On branch master
    nothing to commit (working directory clean)

### Rewriting history

#### Resetting your committed changes

Let’s say you want to get rid of the last commit:

    $ git log --oneline -2
    648b0ad Added test file quux and made changes to foobar.
    e2a8b47 Added foobar.

You can tell Git to reset from where you are minus one commit:

    $ git reset HEAD~1

That last commit is gone.

    $ git log --oneline -2
    e2a8b47 Added foobar.
    12b41be Renamed README to README.txt and deleted hello.

But the files and changes are still there:

    $ git status
    # On branch master
    # Your branch and 'origin/master' have diverged,D
    # and have 1 and 2 different commit(s) each, respectively.
    #
    # Changed but not updated:
    #   (use "git add <file>..." to update what will be committed)
    #   (use "git checkout -- <file>..." to discard changes in working directory)
    #
    #   modified:   foobar
    #
    # Untracked files:
    #   (use "git add <file>..." to include in what will be committed)
    #
    #   quux
    no changes added to commit (use "git add" and/or "git commit -a")

**NOTE:** This is because by default `git reset` will revert the commits but leave the changes in place. This is useful in case you want to make some further changes and re-commit. If you wish to completely obliterate the commit and its changes you can do `git reset --hard`.

For now let’s manually clean up our working directory and stage.

    $ git checkout -- foobar
    $ rm quux


#### Resetting your committed changes with a rebase

Another way you can undo committed changes is by rebasing your repository:

    $ git log --oneline
    e2a8b47 Added foobar.
    12b41be Renamed README to README.txt and deleted hello.
    4ff1af9 Added a date to README and 'hello world' to hello.
    b80e06b Added some notes to README.
    5de611b Added hello.
    ed7d7ff Added README.

We want to remove the commit where we added `foobar`. It’s the first commit in our commit history.

To do an interactive rebase we need to have at least to commits to rebase so we call `git rebase` on HEAD minus two commits.

    $ git rebase -i HEAD~2

    # vim
      1 pick 12b41be Renamed README to README.txt and deleted hello.
    ->2 # pick e2a8b47 Added foobar.
      3
      4 # Rebase 4ff1af9..e2a8b47 onto 4ff1af9
      5 #
      6 # Commands:
      7 #  p, pick = use commit
      8 #  r, reword = use commit, but edit the commit message
      9 #  e, edit = use commit, but stop for amending
     10 #  s, squash = use commit, but meld into previous commit
     11 #  f, fixup = like "squash", but discard this commit's log message
     12 #  x <cmd>, exec <cmd> = Run a shell command <cmd>, and stop if it fails
     13 #
     14 # If you remove a line here THAT COMMIT WILL BE LOST.
     15 # However, if you remove everything, the rebase will be aborted.

    $ git log --oneline
    12b41be Renamed README to README.txt and deleted hello.
    4ff1af9 Added a date to README and 'hello world' to hello.
    b80e06b Added some notes to README.
    5de611b Added hello.
    ed7d7ff Added README.

#### Merging commits

    $ git log --oneline
    12b41be Renamed README to README.txt and deleted hello.
    4ff1af9 Added a date to README and 'hello world' to hello.
    b80e06b Added some notes to README.
    5de611b Added hello.
    ed7d7ff Added README.

We want to merge the last three commits into a single one:

    $ git rebase -i HEAD~3

    # vim
      1 pick b80e06b Added some notes to README.
    ->2 fixup 4ff1af9 Added a date to README and 'hello world' to hello.
    ->3 squash 12b41be Renamed README to README.txt and deleted hello.
      4
      5 # Rebase 5de611b..12b41be onto 5de611b
      6 #
      7 # Commands:
      8 #  p, pick = use commit
      9 #  r, reword = use commit, but edit the commit message
     10 #  e, edit = use commit, but stop for amending
     11 #  s, squash = use commit, but meld into previous commit
     12 #  f, fixup = like "squash", but discard this commit's log message
     13 #  x <cmd>, exec <cmd> = Run a shell command <cmd>, and stop if it fails
     14 #
     15 # If you remove a line here THAT COMMIT WILL BE LOST.
     16 # However, if you remove everything, the rebase will be aborted.
     17 #

     # save and exit vim

Git automatically prompts you to update the commit messages and explains what’s happening:

     # vim
       1 # This is a combination of 3 commits.
       2 # The first commit's message is:
       3 Added some notes to README.
       4
       5 # The 2nd commit message will be skipped:
       6
       7 #   Added a date to README and 'hello world' to hello.
       8
       9 # This is the 3rd commit message:
      10
    ->11 Renamed README to README.txt.
      12
      13 # Please enter the commit message for your changes. Lines starting
      14 # with '#' will be ignored, and an empty message aborts the commit.
      15 #
      16 # Author:    castroad <castroad@yahoo-inc.com>
      17 #
      18 # Not currently on any branch.
      19 # Changes to be committed:
      20 #   (use "git reset HEAD <file>..." to unstage)
      21 #
      22 #   deleted:    README
      23 #   new file:   README.txt
      24 #   deleted:    hello
      25 #

    # save and exit vim

    $ git log --oneline
    9341986 Added some notes to README.
    5de611b Added hello.
    ed7d7ff Added README.

### Stashing files