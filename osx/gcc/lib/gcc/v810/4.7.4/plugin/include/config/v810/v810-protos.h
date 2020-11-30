/* Prototypes for v810.c functions used in the md file & elsewhere.
   Copyright (C) 1999, 2000, 2002, 2004, 2005, 2007, 2010, 2011
   Free Software Foundation, Inc.

   This file is part of GCC.

   GCC is free software; you can redistribute it and/or modify
   it under the terms of the GNU General Public License as published by
   the Free Software Foundation; either version 3, or (at your option)
   any later version.

   GCC is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.

   You should have received a copy of the GNU General Public License
   along with GCC; see the file COPYING3.  If not see
   <http://www.gnu.org/licenses/>.  */

/* Function prototypes that cannot exist in v810.h due to dependency
   complications.  */
#ifndef GCC_V810_PROTOS_H
#define GCC_V810_PROTOS_H

extern void   expand_prologue               (void);
extern void   expand_epilogue               (void);
extern int    v810_handle_pragma            (int (*)(void), void (*)(int), char *);
extern int    compute_register_save_size    (long *);
extern int    compute_frame_size            (int, long *);
extern void   v810_init_expanders           (void);

#ifdef RTX_CODE
extern HOST_WIDE_INT v810_initial_elimination_offset (int, int);
extern rtx    v810_return_addr              (int);
extern const char *output_move_single       (rtx *);
extern void   notice_update_cc              (rtx, rtx);
extern char * construct_save_jal            (rtx);
extern char * construct_restore_jr          (rtx);
#ifdef HAVE_MACHINE_MODES
extern rtx    v810_gen_compare              (enum rtx_code, enum machine_mode,
					     rtx, rtx);
// JCB
// extern enum machine_mode  v810_select_cc_mode (RTX_CODE, rtx, rtx);
#endif
#endif /* RTX_CODE */

#ifdef TREE_CODE
extern int    v810_interrupt_function_p     (tree);
extern void   v810_output_aligned_bss       (FILE *, tree, const char *, unsigned HOST_WIDE_INT, int);
extern void   v810_output_common            (FILE *, tree, const char *, int, int);
extern void   v810_output_local             (FILE *, tree, const char *, int, int);
extern v810_data_area v810_get_data_area    (tree);
#endif

extern void ghs_pragma_section		    (struct cpp_reader *);
extern void ghs_pragma_interrupt	    (struct cpp_reader *);
extern void ghs_pragma_starttda		    (struct cpp_reader *);
extern void ghs_pragma_startsda		    (struct cpp_reader *);
extern void ghs_pragma_startzda		    (struct cpp_reader *);
extern void ghs_pragma_endtda		    (struct cpp_reader *);
extern void ghs_pragma_endsda		    (struct cpp_reader *);
extern void ghs_pragma_endzda		    (struct cpp_reader *);

#endif /* ! GCC_V810_PROTOS_H */
