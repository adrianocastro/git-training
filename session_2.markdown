# The Git sessions
## Session 2: Undoing things

### Changing the last commit

    $ git log --oneline -2
    b736ad1 Renamed README and deleted hello.
    4ff1af9 Added a date to README and 'hello world' to hello.

    $ git commit --amend
    # Change message to "Renamed README to README.txt and deleted hello."

    $ git log --oneline -2
    12b41be Renamed README to README.txt and deleted hello.
    4ff1af9 Added a date to README and 'hello world' to hello.

#### Using it to add missed files to a commit

    $ echo 'Completed Session 1.' >> README.txt
    $ touch foobar

    $ git add README.txt
    $ git commit -m "Completed session 1."

Forgot to add foobar. Let’s fix that:

    $ git add foobar
    $ git commit -amend
    # Change message to "Completed session 1 and added foobar."

    $ git log --oneline -2
    fac0dd4 Completed session 1 and added foobar.
    12b41be Renamed README to README.txt and deleted hello.

    $ git show fac0dd4
    commit fac0dd4e7a93c6bba1e3de8fdfa1b03189228871
    Author: castroad <castroad@yahoo-inc.com>
    Date:   Mon Apr 2 15:14:57 2012 -0700

        Completed session 1 and added foobar.

    diff --git a/README.txt b/README.txt
    index 75a69aa..97c0a5a 100644
    --- a/README.txt
    +++ b/README.txt
    @@ -1,3 +1,4 @@
     This is my Git training repository.
     --castroad
     Mon Apr 2 15:02:28 PDT 2012
    +Completed Session 1.
    diff --git a/foobar b/foobar
    new file mode 100644
    index 0000000..e69de29

### Unstaging files

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

You’re basically telling git to reset `foobar` to the last known commit (`HEAD` = the tip of the branch).

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

### Reverting changes

If you wanted to discard the changes made to `foobar`

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
    $ git status
    # On branch master
    nothing to commit (working directory clean)

### Reverting to a previous commit
### Stashing files
