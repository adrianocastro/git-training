# The Git sessions

- Session 1: The Basics
- Session 2: Undoing Things
- **Session 3: Using git with svn.corp**
- Session 4: Branching and Merging
- Session 5: Working with Remotes

* * *

## Session 3: Using git with svn.corp

- Cloning from an svn repository
- Diffing local with code in Subversion
    - Creating code reviews in Review Board
- Pulling changes from Subversion
- Pushing changes to Subversion

* * *

### Getting help

IRC:

- [\#zed-git](http://irc.corp.yahoo.com/join/zed-git) @ [irc.corp.yahoo.com](irc://irc.corp.yahoo.com/)

Interactively:

    $ git help <verb>
    $ git <verb> --help
    $ man git-<verb>

Online:

- [Git Reference](http://gitref.org/)
- [Git Community Book](http://book.git-scm.com/)
- [git ready](http://gitready.com/)
- [Pro Git](http://progit.org/)

* * *

### svn.corp as a remote repository

Up until now we’ve been working on local Git repositories. As a team we need to be able to share our code and push it to a central location.

In the future this location will be a corp managed Git repository but, for now, we use good old svn.corp.

* * *

### Introducing git svn

`git svn` provides two-way communication between a Git and Subversion repository. This allows us to work locally with Git, taking full advantage of its added benefits (e.g. locally managed commits, easy branching and merging, sharing with other developers) whilst still being able to pull and push code to and from Subversion.

* * *

### Getting git svn

At Y!:

    $ yinst install yapr-1.2.12_1 yapr_util-1.2.12_1 git_svn_y-test ysubversion-1.5.6_2 ysubversion_perl-1.5.6_6 git_core_y-test -downgrade

Everywhere else: `git svn` should come bundled with Git.

Try it:

    $ git svn

* * *

### Cloning a Subversion Repository

Similarly to what we do with Subversion we start by checking out (or cloning in Git lingo) our remote Subversion repository:

    $ git svn clone svn+ssh://svn.corp.yahoo.com/yahoo/users/castroad/scratch ~/git-svn-training
    Initialized empty Git repository in /tmp/git-svn-training/.git/
    W: Ignoring error from SVN, path probably does not exist: (160013): Filesystem has no item: File not found: revision 100, path '/castroad/scratch'
    W: Do not be alarmed at the above message git-svn is just searching aggressively for old history.
    This may take a while on large repositories
    Checked Ahrough README
    r40377 = c2f37238a4701cf2a94cc8aa8f12bddcb2e3c11c (refs/remotes/git-svn)
    Checked out HEAD:
      svn+ssh://svn.corp.yahoo.com/yahoo/users/castroad/scratch r40377

As you can see, this creates a new Git repository in the directory named `git-svn-training`, populates the Git history with all Subversion commits to the trunk, and checks out the latest HEAD.

* * *

### Diffing with svn

Let’s add our name to `users`.

    $ echo $USER >> users
    $ git commit -am "Added $USER to the users file."

To see how our repository has changed from Subversion we can `git diff` to the last known code we pulled from SVN:

    $ git log
    062a8b8 Added castroad to the users file.
    6a00e22 Added users file.
    5ebc4b3 Added user file.
    c2f3723 Created scratch and added README.

    $ git diff 6a00e22
    diff --git a/users b/users
    index e69de29..9396e01 100644
    --- a/users
    +++ b/users
    @@ -0,0 +1 @@
    +castroad

Or we can use `git svn-diff` which automagically knows what that commit is:

    $ yinst i git_svn_diff-current

    $ git svn-diff
    Index: users
    ===================================================================
    --- users       (revision 40381)
    +++ users       (working copy)
    @@ -0,0 +1 @@
    +castroad

* * *

#### Creating code reviews in Review Board

Let’s start by installing `crpost`:

    $ yinst i crpost

In addition to knowing what was the last commit you pulled from Subversion `git svn-diff` also happens to create diffs in `crpost` friendly `svn diff` format.

Friendly `git svn-diff` comes to the rescue, again:

    $ git svn-diff | crpost --bug-id 5521451 --reviewer castroad
    Backyard password (castroad): butterflies
    Created review 98767 [ http://codereview.corp.yahoo.com/r/98767 ]

* * *

### Pulling changes from Subversion

    $ git svn rebase
        M   LATEST
    r3 = ae409c2f5fe0831f22d6dc891652b5f9159f35de (git-svn)
    First, rewinding head to replay your work on top of it...
    Applying: Local git commit.

The output shows us a list of modified files, then informs us revision 3 from Subversion is being stored in commit `ae409c2`.

The rewinding portion is `git svn` taking the svn HEAD and then applying your work on top of it.

* * *

### Pushing change to Subversion

You’ve finished your feature/bug, tested it thoroughly, had it code-reviewed and all is well. It’s time to push them to Subversion:

    # First lets update from Subversion
    $ git svn rebase
    Current branch master is up to date.

    # Now lets push our code
    $ git svn dcommit
    Committing to svn+ssh://svn.corp.yahoo.com/yahoo/users/castroad/scratch ...
            M       users
    Committed r40382
            M       users
    r40382 = de1a3bec31903f1bd0bd61b1842a1d329e06080e (refs/remotes/git-svn)
    No changes between current HEAD and refs/remotes/git-svn
    Resetting to the latest refs/remotes/git-svn

Your local Git and remote Subversion repositories are now in sync.

* * *

### Handling merge conflicts

So, you’ve pulled from Subversion and you ended up with some conflicts:

    $ git svn rebase
        M   README
    r40384 = 08fe6fa7036b3400ce546e92adef55f82cf1a27b (refs/remotes/git-svn)
    First, rewinding head to replay your work on top of it...
    Applying: Hoping to break README
    Using index info to reconstruct a base tree...
    Falling back to patching base and 3-way merge...
    Auto-merging README
    CONFLICT (content): Merge conflict in REAMDE
    Failed to merge in the changes.
    Patch failed at 0001 Hoping to break README

    When you have resolved this problem run "git rebase --continue".
    If you would prefer to skip this patch, instead run "git rebase --skip".
    To restore the original branch and stop rebasing run "git rebase --abort".

    rebase refs/remotes/git-svn: command returned error: 1

    # manually fix the conflicts or use git mergetool

    $ git add
    $ git rebase --continue

That is all.

You can also skip or abort the merge:

    $ git rebase –skip
    $ git rebase –abort

* * *

### Pitfalls of git svn

As awesome as rewriting history may be (remember session 2?) please **remember not to** amend, reorder, or otherwise change commits that have been dcommited to Subversion. Subversion cannot handle modifying or reordering commits.

This is essentially the same rule as not changing Git commits that have been pushed to public repositories.

* * *

## Summary

- Even without a central shared remote Git repository we can still take advantage of Git
- `git svn` makes it possible to keep Git and Subversion in sync
- `git svn-diff` allows us to create code-reviews in Review Board
