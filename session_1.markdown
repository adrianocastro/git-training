# The Git sessions
## Session 1: The Basics

### What's Git?
- version control system
- open source
- <q>created by the same dudes that created Linux</q> [^github-intro]
- <q>At the heart of GitHub</q> [^github-intro] <small>(this will make sense later)</small>

[^github-intro]: http://help.github.com/mac-set-up-git/

### Git !== GitHub

- <q>**Git** is an extremely fast, efficient, distributed version control system ideal for the collaborative development of software</q> [^git_vs_github]
- <q>**GitHub** is the best way to collaborate with others. Fork, send pull requests and manage all your public and private Git repositories.</q> [^git_vs_github]
    - think of it as SVN viewer, bugzilla and codereview.corp combined

[^git_vs_github]: https://github.com/

### How is it different from SVN?
- **SVN** is a **centralised** version control system
    - everyone contributes to a single repository
- **Git** is a **distributed** version control system
    - each clone is a full mirror of the repository
    - you can contribute to multiple repositories

Read more about the [different types of version control systems](http://progit.org/book/ch1-1.html).

### Centralized VCS
![Centralized version control diagram](http://progit.org/figures/ch1/18333fig0102-tn.png)

### Distributed VCS
![Distributed version control diagram](http://progit.org/figures/ch1/18333fig0103-tn.png)

### Distributed? Wait. What?!

- each clone is a full mirror of the repository
- works offline
    - works even when the repository you push to is down
- works very well with several remote repositories
- fast because most operations are run locally
- branching is easy and even encouraged
- merging is much easier
- allows for better collaboration across teams

### How does all of this translate into every day coding?

- commit early, commit often, commit without fear
    - key changes are versioned and safe
- branch for features
- branch for experiments
- branch for testing
- collaborate with others
    - no more sharing code on pastebin, email or ping

### Installation and configuration (name, email)
#### Getting Git

- at Y!: `$ yinst i git_core_y`
- everywhere else: [see instructions in Pro Git](http://progit.org/book/ch1-4.html)

Try it:

    $ git

#### Configuration

    $ git config --global user.name `whoami`
    $ git config --global user.email `whoami`@yahoo-inc.com

    # Make it look pretty
    $ git config color.ui true

Note: in normal situations `user.name` would be your actual name but at Y! it has to be your Y!ID.

### Creating your first Git repository

    $ mkdir ~/git-training
    $ cd ~/git-training

    # this will initialise the git-training directory
    # as a git repository

    $ git init

Git will reply: `Initialized empty Git repository in .git/`

### What’s in the .git directory

- `.git/` is where Git stores the metadata and object database for the repository
- We’ll come back to it later

### Checking the status of the repository

    $ git status
    # Nothing to commit

    $ touch README

    $ git status
    (…)
    # Untracked files:
    #   (use "git add <file>..." to include in what will be committed)
    #
    #   README
    nothing added to commit but untracked files present (use "git add" to track)

### The four states

- **untracked**
    - file isn’t under version control
- **committed** (unmodified)
    - file is safely stored in the repository’s database
- **modified**
    - file has changed but hasn’t been committed yet
- **staged**
    - modified file has been marked in its current version as ready to be committed

![The lifecycle of the status of your files](http://progit.org/figures/ch2/18333fig0201-tn.png)

### The three sections

- **git directory**
    - where **committed** files live
- **working directory**
    - where **modified** and **untracked** files live
- **staging** (aka index)
    - where **staged** files live

![Working directory, staging area, and git directory](http://progit.org/figures/ch1/18333fig0106-tn.png)

### Adding files

    $ git add README
    $ git status
    (…)
    # Changes to be committed:
    #   (use "git rm --cached <file>..." to unstage)
    #
    #   new file:   README

### Committing files

    $ git commit

    # Or with an inline commit message
    $ git commit -m 'Added README.'

    [master (root-commit) 454a516] Added README.
     0 files changed, 0 insertions(+), 0 deletions(-)
     create mode 100644 README

Where:

- `master` is the branch the file was committed to
- `454a516` is the SHA-1 checksum which uniquely identifies the commit
- `0 files changed, 0 insertions(+), 0 deletions(-)` because the file was empty and git is looking at the file’s contents
- `mode 100644 README` because the file was added with `644` permissions, i.e. world readable but only writeable by the owner (`rw-r--r--`)

### Staging and committing files selectively

    $ echo 'This is my Git training repository.' > README
    $ touch hello

    $ git status
    # On branch master
    # Changed but not updated:
    #   (use "git add <file>..." to update what will be committed)
    #   (use "git checkout -- <file>..." to discard changes in working directory)
    #
    #       modified:   README
    #
    # Untracked files:
    #   (use "git add <file>..." to include in what will be committed)
    #
    #       hello
    no changes added to commit (use "git add" and/or "git commit -a")
    $ git add hello
    $ git commit -m "Added hello."

### Staging modified files

    $ git add README
    $ git status
    # On branch master
    # Changes to be committed:
    #   (use "git reset HEAD <file>..." to unstage)
    #
    #       modified:   README
    #

**Heads up:** If you make another change to the file:

    $ echo "--`whoami`" >> README
    $ git status
    # On branch master
    # Changes to be committed:
    #   (use "git reset HEAD <file>..." to unstage)
    #
    #       modified:   README
    #
    # Changed but not updated:
    #   (use "git add <file>..." to update what will be committed)
    #   (use "git checkout -- <file>..." to discard changes in working directory)
    #
    #       modified:   README
    #

Now `README` is listed as **both staged and unstaged**.

Git stages a file exactly as it is when you run the `git add` command. If you commit now, the version of `README` as it was when you last ran the git add command is how it will go into the commit, not the version of the file as it looks in your working directory when you run `git commit`. If you modify a file after you run `git add`, you have to run `git add` again to stage the latest version of the file:

    $ git add README
    $ git commit -m "Added some notes to README."
    [master dc1ae3d] Added some notes to README.
     1 files changed, 2 insertions(+), 0 deletions(-)

### Viewing your changes

    $ echo `date` >> README
    $ echo 'Hello World.' > hello

    $ git status -s   # -s for short output
     M README
     M hello

    $ git diff
    diff --git a/README b/README
    index e69de29..f5320a7 100644
    --- a/README
    +++ b/README
    @@ -0,0 +1 @@
    +This is my Git training repository.
    diff --git a/hello b/hello
    index e69de29..f534deb 100644
    --- a/hello
    +++ b/hello
    @@ -0,0 +1 @@
    +Hello World.

### Viewing your changes in stage and HEAD

    $ git add README

    $ git diff
    diff --git a/hello b/hello
    index e69de29..f534deb 100644
    --- a/hello
    +++ b/hello
    @@ -0,0 +1 @@
    +Hello World.

To see the changes in staged files:

    $ git diff --staged
    diff --git a/README b/README
    index e69de29..f5320a7 100644
    --- a/README
    +++ b/README
    @@ -0,0 +1 @@
    +This is my Git training repository.

To see all changes:

    $ git diff HEAD

Where `HEAD` points to the latest commit (the tip of the branch you’re in).

### Skipping the staging area

Sometimes you don’t need the fine grain control the staging area offers and just want to commit all the files you’ve changed.

    $ git status -s
    M  README
     M hello

    $ git commit -a -m "Added a date to README and 'hello world' to hello."

### Moving and deleting files

    $ git mv README README.txt
    $ git rm hello

Move and delete operations are performed on tracked files so they are automatically staged. Don’t forget to commit the changes.

    $ git status
    # On branch master
    # Changes to be committed:
    #   (use "git reset HEAD <file>..." to unstage)
    #
    #       renamed:    README -> README.txt
    #       deleted:    hello
    #

    $ git commit -m "Renamed README and deleted hello."

### Viewing the commit history

    $ git log
    commit fd1cadc7a2abf331e0ea2a41b9e781950438a4c3
    Author: castroad <castroad@yahoo-inc.com>
    Date:   Mon Apr 2 12:51:00 2012 -0700

        Renamed README and deleted hello.

    commit 57faee4d438a31d63fd3dbfece70af9446e07928
    Author: castroad <castroad@yahoo-inc.com>
    Date:   Mon Apr 2 12:49:39 2012 -0700

        Added a date to README and 'hello world' to hello.

To view the actual changes (for patching, code reviews, etc):

    # Show only the last 2 commits
    $ git log -p -2
    (…)

Other options:

    - `--stat`: abbreviated stats for each commit
    - `--oneline`: one liner simple output

### Inspecting specific commits

    $ git log --oneline
    22021a3 Renamed README and deleted hello.
    2f5cd24 Added a date to README and 'hello world' to hello.
    ba954b2 Added some notes to README.
    e6c1b31 Added hello.
    f163019 Added README.

    $ git show 2f5cd24
    (…)

#### Viewing diffs between specific commits

    $ git log --oneline
    22021a3 Renamed README and deleted hello.
    2f5cd24 Added a date to README and 'hello world' to hello.
    ba954b2 Added some notes to README.
    e6c1b31 Added hello.
    f163019 Added README.

    $ git diff ba954b2..2f5cd24
    (…)


### Getting help

Interactively:

    $ git help <verb>
    $ git <verb> --help
    $ man git-<verb>

Online:

- http://gitref.org/
- http://book.git-scm.com/
- http://gitready.com/
- http://progit.org/