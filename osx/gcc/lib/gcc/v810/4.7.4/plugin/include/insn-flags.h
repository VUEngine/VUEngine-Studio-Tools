/* Generated automatically by the program `genflags'
   from the machine description file `md'.  */

#ifndef GCC_INSN_FLAGS_H
#define GCC_INSN_FLAGS_H

#define HAVE_cmpsi_insn 1
#define HAVE_cmpsf_insn (TARGET_V810)
#define HAVE_addsi3 1
#define HAVE_subsi3 1
#define HAVE_negsi2 1
#define HAVE_mulsi3 1
#define HAVE_divmodsi4 1
#define HAVE_divsi3 1
#define HAVE_udivmodsi4 1
#define HAVE_udivsi3 1
#define HAVE_andsi3 1
#define HAVE_iorsi3 1
#define HAVE_xorsi3 1
#define HAVE_one_cmplsi2 1
#define HAVE_setf_insn 1
#define HAVE_jump 1
#define HAVE_indirect_jump 1
#define HAVE_tablejump 1
#define HAVE_call_internal_short 1
#define HAVE_call_value_internal_short 1
#define HAVE_nop 1
#define HAVE_ashlsi3 1
#define HAVE_lshrsi3 1
#define HAVE_ashrsi3 1
#define HAVE_return_simple (reload_completed)
#define HAVE_return_internal 1
#define HAVE_addsf3 (TARGET_V810)
#define HAVE_subsf3 (TARGET_V810)
#define HAVE_mulsf3 (TARGET_V810)
#define HAVE_divsf3 (TARGET_V810)
#define HAVE_fix_truncsfsi2 (TARGET_V810)
#define HAVE_floatsisf2 (TARGET_V810)
#define HAVE_save_interrupt 1
#define HAVE_return_interrupt 1
#define HAVE_movqi 1
#define HAVE_movhi 1
#define HAVE_movsi 1
#define HAVE_cbranchsi4 1
#define HAVE_cstoresi4 1
#define HAVE_cmpsi 1
#define HAVE_cmpsf 1
#define HAVE_casesi 1
#define HAVE_call 1
#define HAVE_call_value 1
#define HAVE_zero_extendhisi2 1
#define HAVE_zero_extendqisi2 1
#define HAVE_extendhisi2 1
#define HAVE_extendqisi2 1
#define HAVE_prologue 1
#define HAVE_epilogue 1
extern rtx        gen_cmpsi_insn                (rtx, rtx);
extern rtx        gen_cmpsf_insn                (rtx, rtx);
extern rtx        gen_addsi3                    (rtx, rtx, rtx);
extern rtx        gen_subsi3                    (rtx, rtx, rtx);
extern rtx        gen_negsi2                    (rtx, rtx);
extern rtx        gen_mulsi3                    (rtx, rtx, rtx);
extern rtx        gen_divmodsi4                 (rtx, rtx, rtx, rtx);
extern rtx        gen_divsi3                    (rtx, rtx, rtx);
extern rtx        gen_udivmodsi4                (rtx, rtx, rtx, rtx);
extern rtx        gen_udivsi3                   (rtx, rtx, rtx);
extern rtx        gen_andsi3                    (rtx, rtx, rtx);
extern rtx        gen_iorsi3                    (rtx, rtx, rtx);
extern rtx        gen_xorsi3                    (rtx, rtx, rtx);
extern rtx        gen_one_cmplsi2               (rtx, rtx);
extern rtx        gen_setf_insn                 (rtx, rtx);
extern rtx        gen_jump                      (rtx);
extern rtx        gen_indirect_jump             (rtx);
extern rtx        gen_tablejump                 (rtx, rtx);
extern rtx        gen_call_internal_short       (rtx, rtx);
extern rtx        gen_call_value_internal_short (rtx, rtx, rtx);
extern rtx        gen_nop                       (void);
extern rtx        gen_ashlsi3                   (rtx, rtx, rtx);
extern rtx        gen_lshrsi3                   (rtx, rtx, rtx);
extern rtx        gen_ashrsi3                   (rtx, rtx, rtx);
extern rtx        gen_return_simple             (void);
extern rtx        gen_return_internal           (void);
extern rtx        gen_addsf3                    (rtx, rtx, rtx);
extern rtx        gen_subsf3                    (rtx, rtx, rtx);
extern rtx        gen_mulsf3                    (rtx, rtx, rtx);
extern rtx        gen_divsf3                    (rtx, rtx, rtx);
extern rtx        gen_fix_truncsfsi2            (rtx, rtx);
extern rtx        gen_floatsisf2                (rtx, rtx);
extern rtx        gen_save_interrupt            (void);
extern rtx        gen_return_interrupt          (void);
extern rtx        gen_movqi                     (rtx, rtx);
extern rtx        gen_movhi                     (rtx, rtx);
extern rtx        gen_movsi                     (rtx, rtx);
extern rtx        gen_cbranchsi4                (rtx, rtx, rtx, rtx);
extern rtx        gen_cstoresi4                 (rtx, rtx, rtx, rtx);
extern rtx        gen_cmpsi                     (rtx, rtx);
extern rtx        gen_cmpsf                     (rtx, rtx);
extern rtx        gen_casesi                    (rtx, rtx, rtx, rtx, rtx);
#define GEN_CALL(A, B, C, D) gen_call ((A), (B))
extern rtx        gen_call                      (rtx, rtx);
#define GEN_CALL_VALUE(A, B, C, D, E) gen_call_value ((A), (B), (C))
extern rtx        gen_call_value                (rtx, rtx, rtx);
extern rtx        gen_zero_extendhisi2          (rtx, rtx);
extern rtx        gen_zero_extendqisi2          (rtx, rtx);
extern rtx        gen_extendhisi2               (rtx, rtx);
extern rtx        gen_extendqisi2               (rtx, rtx);
extern rtx        gen_prologue                  (void);
extern rtx        gen_epilogue                  (void);

#endif /* GCC_INSN_FLAGS_H */
